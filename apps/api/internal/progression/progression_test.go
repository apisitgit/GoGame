package progression

import (
	"testing"

	"github.com/socket9companylimited/go-quest/apps/api/internal/domain"
)

func TestCompleteLessonRewardAppliesHintPenalties(t *testing.T) {
	tests := []struct {
		name      string
		hintCount int
		expected  int
	}{
		{name: "no hint", hintCount: 0, expected: 100},
		{name: "first hint free", hintCount: 1, expected: 100},
		{name: "second hint penalty", hintCount: 2, expected: 90},
		{name: "third hint penalty", hintCount: 3, expected: 70},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CompleteLessonReward(100, tt.hintCount)
			if got != tt.expected {
				t.Fatalf("expected %d, got %d", tt.expected, got)
			}
		})
	}
}

func TestCalculateLevel(t *testing.T) {
	level := CalculateLevel(100)

	if level.Level != 2 {
		t.Fatalf("expected level 2, got %d", level.Level)
	}
	if level.EXPToNextLevel != 150 {
		t.Fatalf("expected 150 exp to next level, got %d", level.EXPToNextLevel)
	}
}

func TestEnrichUnlocksFirstAchievementAndNextSkill(t *testing.T) {
	progress := Enrich(domain.PlayerProgress{
		PlayerID: "11111111-1111-4111-8111-111111111111",
		TotalEXP: 100,
		Quests: []domain.QuestProgress{
			{
				QuestID: "hello-gopher",
				Status:  domain.QuestStatusCompleted,
			},
		},
	})

	if progress.Achievements[0].Status != domain.AchievementStatusUnlocked {
		t.Fatalf("expected first achievement unlocked, got %s", progress.Achievements[0].Status)
	}
	if progress.SkillTree[0].Status != domain.SkillStatusCompleted {
		t.Fatalf("expected first skill completed, got %s", progress.SkillTree[0].Status)
	}
	if progress.SkillTree[0].PrerequisiteIDs == nil {
		t.Fatal("expected first skill prerequisites to be an empty array, got nil")
	}
	if progress.SkillTree[1].Status != domain.SkillStatusUnlocked {
		t.Fatalf("expected variables unlocked, got %s", progress.SkillTree[1].Status)
	}
	if progress.SkillTree[2].Status != domain.SkillStatusLocked {
		t.Fatalf("expected conditions locked, got %s", progress.SkillTree[2].Status)
	}
}
