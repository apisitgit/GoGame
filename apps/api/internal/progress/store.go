package progress

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/socket9companylimited/go-quest/apps/api/internal/domain"
)

var ErrNotFound = errors.New("not found")

type Store struct {
	pool *pgxpool.Pool
}

type UpsertQuestProgressInput struct {
	PlayerID string
	QuestID  string
	Status   domain.QuestStatus
}

type CreateSubmissionInput struct {
	PlayerID      string
	QuestID       string
	LessonID      string
	SourceSize    int
	Status        domain.SubmissionStatus
	StdoutPreview string
	Feedback      string
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

func (store *Store) ListLessons(ctx context.Context) ([]domain.Lesson, error) {
	rows, err := store.pool.Query(ctx, `
		SELECT id, quest_id, title, world, concepts, content
		FROM lessons
		ORDER BY created_at, id
	`)
	if err != nil {
		return nil, fmt.Errorf("list lessons: %w", err)
	}
	defer rows.Close()

	lessons := make([]domain.Lesson, 0)
	for rows.Next() {
		lesson, err := scanLesson(rows)
		if err != nil {
			return nil, err
		}
		lessons = append(lessons, lesson)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate lessons: %w", err)
	}

	return lessons, nil
}

func (store *Store) GetLesson(ctx context.Context, lessonID string) (domain.Lesson, error) {
	row := store.pool.QueryRow(ctx, `
		SELECT id, quest_id, title, world, concepts, content
		FROM lessons
		WHERE id = $1
	`, lessonID)

	lesson, err := scanLesson(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Lesson{}, ErrNotFound
	}
	if err != nil {
		return domain.Lesson{}, err
	}

	return lesson, nil
}

func (store *Store) GetProgress(ctx context.Context, playerID string) (domain.PlayerProgress, error) {
	if err := store.ensurePlayer(ctx, playerID); err != nil {
		return domain.PlayerProgress{}, err
	}

	rows, err := store.pool.Query(ctx, `
		SELECT q.id,
		       COALESCE(pp.status, 'available') AS status,
		       COALESCE(pp.earned_exp, 0) AS earned_exp,
		       pp.completed_at,
		       COALESCE(pp.updated_at, q.created_at) AS updated_at
		FROM quests q
		LEFT JOIN player_progress pp ON pp.quest_id = q.id AND pp.player_id = $1
		ORDER BY q.created_at, q.id
	`, playerID)
	if err != nil {
		return domain.PlayerProgress{}, fmt.Errorf("get progress: %w", err)
	}
	defer rows.Close()

	progress := domain.PlayerProgress{
		PlayerID: playerID,
		Quests:   make([]domain.QuestProgress, 0),
	}
	for rows.Next() {
		var item domain.QuestProgress
		if err := rows.Scan(&item.QuestID, &item.Status, &item.EarnedEXP, &item.CompletedAt, &item.UpdatedAt); err != nil {
			return domain.PlayerProgress{}, fmt.Errorf("scan progress: %w", err)
		}
		progress.TotalEXP += item.EarnedEXP
		progress.Quests = append(progress.Quests, item)
	}

	if err := rows.Err(); err != nil {
		return domain.PlayerProgress{}, fmt.Errorf("iterate progress: %w", err)
	}

	return progress, nil
}

func (store *Store) UpsertQuestProgress(ctx context.Context, input UpsertQuestProgressInput) (domain.PlayerProgress, error) {
	tx, err := store.pool.Begin(ctx)
	if err != nil {
		return domain.PlayerProgress{}, fmt.Errorf("begin progress transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	if err := ensurePlayerTx(ctx, tx, input.PlayerID); err != nil {
		return domain.PlayerProgress{}, err
	}

	if err := upsertProgressTx(ctx, tx, input.PlayerID, input.QuestID, input.Status); err != nil {
		return domain.PlayerProgress{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.PlayerProgress{}, fmt.Errorf("commit progress transaction: %w", err)
	}

	return store.GetProgress(ctx, input.PlayerID)
}

func (store *Store) CreateSubmission(ctx context.Context, input CreateSubmissionInput) (domain.Submission, error) {
	tx, err := store.pool.Begin(ctx)
	if err != nil {
		return domain.Submission{}, fmt.Errorf("begin submission transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	if err := ensurePlayerTx(ctx, tx, input.PlayerID); err != nil {
		return domain.Submission{}, err
	}

	if input.Status == domain.SubmissionStatusPassed {
		if err := upsertProgressTx(ctx, tx, input.PlayerID, input.QuestID, domain.QuestStatusCompleted); err != nil {
			return domain.Submission{}, err
		}
	}

	var submission domain.Submission
	err = tx.QueryRow(ctx, `
		INSERT INTO submissions (
			player_id,
			quest_id,
			lesson_id,
			source_size,
			status,
			stdout_preview,
			feedback
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, player_id, quest_id, lesson_id, source_size, status, stdout_preview, feedback, created_at
	`, input.PlayerID, input.QuestID, input.LessonID, input.SourceSize, input.Status, input.StdoutPreview, input.Feedback).Scan(
		&submission.ID,
		&submission.PlayerID,
		&submission.QuestID,
		&submission.LessonID,
		&submission.SourceSize,
		&submission.Status,
		&submission.StdoutPreview,
		&submission.Feedback,
		&submission.CreatedAt,
	)
	if err != nil {
		return domain.Submission{}, fmt.Errorf("create submission: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Submission{}, fmt.Errorf("commit submission transaction: %w", err)
	}

	return submission, nil
}

func (store *Store) GetSubmission(ctx context.Context, submissionID string) (domain.Submission, error) {
	var submission domain.Submission
	err := store.pool.QueryRow(ctx, `
		SELECT id, player_id, quest_id, lesson_id, source_size, status, stdout_preview, feedback, created_at
		FROM submissions
		WHERE id = $1
	`, submissionID).Scan(
		&submission.ID,
		&submission.PlayerID,
		&submission.QuestID,
		&submission.LessonID,
		&submission.SourceSize,
		&submission.Status,
		&submission.StdoutPreview,
		&submission.Feedback,
		&submission.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Submission{}, ErrNotFound
	}
	if err != nil {
		return domain.Submission{}, fmt.Errorf("get submission: %w", err)
	}

	return submission, nil
}

func (store *Store) ensurePlayer(ctx context.Context, playerID string) error {
	_, err := store.pool.Exec(ctx, `
		INSERT INTO players (id)
		VALUES ($1)
		ON CONFLICT (id) DO NOTHING
	`, playerID)
	if err != nil {
		return fmt.Errorf("ensure player: %w", err)
	}

	return nil
}

func ensurePlayerTx(ctx context.Context, tx pgx.Tx, playerID string) error {
	if _, err := tx.Exec(ctx, `
		INSERT INTO players (id)
		VALUES ($1)
		ON CONFLICT (id) DO NOTHING
	`, playerID); err != nil {
		return fmt.Errorf("ensure player: %w", err)
	}

	return nil
}

func upsertProgressTx(ctx context.Context, tx pgx.Tx, playerID string, questID string, status domain.QuestStatus) error {
	var rewardEXP int
	if err := tx.QueryRow(ctx, `SELECT reward_exp FROM quests WHERE id = $1`, questID).Scan(&rewardEXP); errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	} else if err != nil {
		return fmt.Errorf("load quest reward: %w", err)
	}

	if status != domain.QuestStatusCompleted {
		_, err := tx.Exec(ctx, `
			INSERT INTO player_progress (player_id, quest_id, status, earned_exp, completed_at, updated_at)
			VALUES ($1, $2, $3, 0, NULL, now())
			ON CONFLICT (player_id, quest_id)
			DO UPDATE SET
				status = CASE
					WHEN player_progress.status = 'completed' THEN player_progress.status
					ELSE EXCLUDED.status
				END,
				updated_at = now()
		`, playerID, questID, status)
		if err != nil {
			return fmt.Errorf("upsert progress: %w", err)
		}
		return nil
	}

	_, err := tx.Exec(ctx, `
		INSERT INTO player_progress (player_id, quest_id, status, earned_exp, completed_at, updated_at)
		VALUES ($1, $2, 'completed', $3, now(), now())
		ON CONFLICT (player_id, quest_id)
		DO UPDATE SET
			status = 'completed',
			earned_exp = CASE
				WHEN player_progress.status = 'completed' THEN player_progress.earned_exp
				ELSE $3
			END,
			completed_at = COALESCE(player_progress.completed_at, now()),
			updated_at = now()
	`, playerID, questID, rewardEXP)
	if err != nil {
		return fmt.Errorf("complete progress: %w", err)
	}

	return nil
}

type lessonRow interface {
	Scan(dest ...any) error
}

func scanLesson(row lessonRow) (domain.Lesson, error) {
	var lesson domain.Lesson
	var contentBytes []byte

	if err := row.Scan(&lesson.ID, &lesson.QuestID, &lesson.Title, &lesson.World, &lesson.Concepts, &contentBytes); err != nil {
		return domain.Lesson{}, fmt.Errorf("scan lesson: %w", err)
	}

	if json.Valid(contentBytes) {
		lesson.Content = contentBytes
	} else {
		lesson.Content = json.RawMessage(`{}`)
	}

	return lesson, nil
}
