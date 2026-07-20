package domain

import (
	"encoding/json"
	"time"
)

type QuestStatus string

const (
	QuestStatusLocked    QuestStatus = "locked"
	QuestStatusAvailable QuestStatus = "available"
	QuestStatusActive    QuestStatus = "active"
	QuestStatusCompleted QuestStatus = "completed"
)

type SubmissionStatus string

const (
	SubmissionStatusPassed        SubmissionStatus = "passed"
	SubmissionStatusFailed        SubmissionStatus = "failed"
	SubmissionStatusCompileError  SubmissionStatus = "compile_error"
	SubmissionStatusRuntimeError  SubmissionStatus = "runtime_error"
	SubmissionStatusTimeout       SubmissionStatus = "timeout"
	SubmissionStatusInternalError SubmissionStatus = "internal_error"
)

type Lesson struct {
	ID       string          `json:"id"`
	QuestID  string          `json:"questId"`
	Title    string          `json:"title"`
	World    string          `json:"world"`
	Concepts []string        `json:"concepts"`
	Content  json.RawMessage `json:"content"`
}

type Quest struct {
	ID        string `json:"id"`
	LessonID  string `json:"lessonId"`
	Title     string `json:"title"`
	Objective string `json:"objective"`
	RewardEXP int    `json:"rewardExp"`
}

type QuestProgress struct {
	QuestID     string      `json:"questId"`
	Status      QuestStatus `json:"status"`
	EarnedEXP   int         `json:"earnedExp"`
	CompletedAt *time.Time  `json:"completedAt,omitempty"`
	UpdatedAt   time.Time   `json:"updatedAt"`
}

type PlayerProgress struct {
	PlayerID string          `json:"playerId"`
	TotalEXP int             `json:"totalExp"`
	Quests   []QuestProgress `json:"quests"`
}

type Submission struct {
	ID            string           `json:"id"`
	PlayerID      string           `json:"playerId"`
	QuestID       string           `json:"questId"`
	LessonID      string           `json:"lessonId"`
	SourceSize    int              `json:"sourceSize"`
	Status        SubmissionStatus `json:"status"`
	StdoutPreview string           `json:"stdoutPreview"`
	Feedback      string           `json:"feedback"`
	CreatedAt     time.Time        `json:"createdAt"`
}

func IsQuestStatus(status QuestStatus) bool {
	switch status {
	case QuestStatusLocked, QuestStatusAvailable, QuestStatusActive, QuestStatusCompleted:
		return true
	default:
		return false
	}
}

func IsSubmissionStatus(status SubmissionStatus) bool {
	switch status {
	case SubmissionStatusPassed,
		SubmissionStatusFailed,
		SubmissionStatusCompileError,
		SubmissionStatusRuntimeError,
		SubmissionStatusTimeout,
		SubmissionStatusInternalError:
		return true
	default:
		return false
	}
}
