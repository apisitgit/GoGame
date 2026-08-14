package progression

import "github.com/socket9companylimited/go-quest/apps/api/internal/domain"

const (
	BaseFirstLessonReward = 100
	HintLevelTwoPenalty   = 10
	HintLevelThreePenalty = 20
)

var levelThresholds = []int{0, 100, 250, 450, 700}

type skillDefinition struct {
	ID              string
	Title           string
	Description     string
	PrerequisiteIDs []string
	QuestID         string
}

type achievementDefinition struct {
	ID          string
	Title       string
	Description string
	UnlockedBy  func(domain.PlayerProgress) bool
}

var skillDefinitions = []skillDefinition{
	{ID: "hello-world", Title: "Hello World", Description: "เริ่มโปรแกรม Go และแสดงข้อความแรก", QuestID: "hello-gopher"},
	{ID: "variables", Title: "Variables", Description: "เก็บข้อมูลไว้ใช้ต่อในโปรแกรม", PrerequisiteIDs: []string{"hello-world"}},
	{ID: "conditions", Title: "Conditions", Description: "ตัดสินใจด้วย if/else", PrerequisiteIDs: []string{"variables"}},
	{ID: "loops", Title: "Loops", Description: "ทำงานซ้ำด้วย for", PrerequisiteIDs: []string{"conditions"}},
	{ID: "functions", Title: "Functions", Description: "แยกงานเป็นชุดคำสั่งที่เรียกซ้ำได้", PrerequisiteIDs: []string{"loops"}},
	{ID: "slices", Title: "Slices", Description: "จัดการชุดข้อมูลแบบยืดหยุ่น", PrerequisiteIDs: []string{"functions"}},
	{ID: "maps", Title: "Maps", Description: "จับคู่ key กับ value", PrerequisiteIDs: []string{"slices"}},
	{ID: "structs", Title: "Structs", Description: "รวมข้อมูลที่เกี่ยวข้องเป็นชนิดเดียว", PrerequisiteIDs: []string{"maps"}},
	{ID: "interfaces", Title: "Interfaces", Description: "ออกแบบตามพฤติกรรมของ object", PrerequisiteIDs: []string{"structs"}},
	{ID: "error-handling", Title: "Error Handling", Description: "รับมือความผิดพลาดแบบ Go", PrerequisiteIDs: []string{"interfaces"}},
	{ID: "goroutines", Title: "Goroutines", Description: "เริ่มงานเบาพร้อมกันหลายงาน", PrerequisiteIDs: []string{"error-handling"}},
	{ID: "channels", Title: "Channels", Description: "ส่งข้อมูลระหว่าง goroutines", PrerequisiteIDs: []string{"goroutines"}},
	{ID: "rest-api", Title: "REST API", Description: "สร้าง endpoint สำหรับ backend", PrerequisiteIDs: []string{"channels"}},
	{ID: "postgresql", Title: "PostgreSQL", Description: "บันทึกข้อมูลลง database", PrerequisiteIDs: []string{"rest-api"}},
	{ID: "testing", Title: "Testing", Description: "เขียน test เพื่อป้องกัน regression", PrerequisiteIDs: []string{"postgresql"}},
	{ID: "production-readiness", Title: "Production Readiness", Description: "เตรียมระบบให้พร้อมใช้งานจริง", PrerequisiteIDs: []string{"testing"}},
}

var achievementDefinitions = []achievementDefinition{
	{
		ID:          "first-gopher-greeting",
		Title:       "First Gopher Greeting",
		Description: "ผ่านภารกิจทักทาย Gopher ครั้งแรก",
		UnlockedBy: func(progress domain.PlayerProgress) bool {
			return isQuestCompleted(progress, "hello-gopher")
		},
	},
	{
		ID:          "level-two",
		Title:       "Level 2 Explorer",
		Description: "สะสม EXP ถึง Level 2",
		UnlockedBy: func(progress domain.PlayerProgress) bool {
			return progress.TotalEXP >= levelThresholds[1]
		},
	},
}

func CompleteLessonReward(baseEXP int, revealedHintCount int) int {
	reward := baseEXP
	if revealedHintCount >= 2 {
		reward -= HintLevelTwoPenalty
	}
	if revealedHintCount >= 3 {
		reward -= HintLevelThreePenalty
	}
	if reward < 0 {
		return 0
	}

	return reward
}

func Enrich(progress domain.PlayerProgress) domain.PlayerProgress {
	progress.Level = CalculateLevel(progress.TotalEXP)
	progress.Achievements = BuildAchievements(progress)
	progress.SkillTree = BuildSkillTree(progress)
	return progress
}

func CalculateLevel(totalEXP int) domain.LevelProgress {
	if totalEXP < 0 {
		totalEXP = 0
	}

	level := 1
	for index, threshold := range levelThresholds {
		if totalEXP >= threshold {
			level = index + 1
		}
	}

	currentLevelEXP := levelThresholds[level-1]
	nextLevelEXP := currentLevelEXP
	if level < len(levelThresholds) {
		nextLevelEXP = levelThresholds[level]
	}

	expToNext := nextLevelEXP - totalEXP
	progressPercent := 100
	if nextLevelEXP > currentLevelEXP {
		expInLevel := totalEXP - currentLevelEXP
		levelSpan := nextLevelEXP - currentLevelEXP
		progressPercent = (expInLevel * 100) / levelSpan
	}
	if expToNext < 0 {
		expToNext = 0
	}

	return domain.LevelProgress{
		Level:           level,
		CurrentEXP:      totalEXP,
		CurrentLevelEXP: currentLevelEXP,
		NextLevelEXP:    nextLevelEXP,
		EXPToNextLevel:  expToNext,
		ProgressPercent: progressPercent,
	}
}

func BuildAchievements(progress domain.PlayerProgress) []domain.Achievement {
	achievements := make([]domain.Achievement, 0, len(achievementDefinitions))
	for _, definition := range achievementDefinitions {
		status := domain.AchievementStatusLocked
		if definition.UnlockedBy(progress) {
			status = domain.AchievementStatusUnlocked
		}

		achievements = append(achievements, domain.Achievement{
			ID:          definition.ID,
			Title:       definition.Title,
			Description: definition.Description,
			Status:      status,
		})
	}

	return achievements
}

func BuildSkillTree(progress domain.PlayerProgress) []domain.SkillProgression {
	completedSkills := make(map[string]bool)
	skills := make([]domain.SkillProgression, 0, len(skillDefinitions))

	for _, definition := range skillDefinitions {
		prerequisiteIDs := definition.PrerequisiteIDs
		if prerequisiteIDs == nil {
			prerequisiteIDs = []string{}
		}

		status := domain.SkillStatusLocked
		if prerequisitesCompleted(completedSkills, prerequisiteIDs) {
			status = domain.SkillStatusUnlocked
		}
		if definition.QuestID != "" && isQuestCompleted(progress, definition.QuestID) {
			status = domain.SkillStatusCompleted
			completedSkills[definition.ID] = true
		}

		skills = append(skills, domain.SkillProgression{
			ID:              definition.ID,
			Title:           definition.Title,
			Description:     definition.Description,
			Status:          status,
			PrerequisiteIDs: prerequisiteIDs,
		})
	}

	return skills
}

func prerequisitesCompleted(completedSkills map[string]bool, prerequisiteIDs []string) bool {
	for _, prerequisiteID := range prerequisiteIDs {
		if !completedSkills[prerequisiteID] {
			return false
		}
	}

	return true
}

func isQuestCompleted(progress domain.PlayerProgress, questID string) bool {
	for _, quest := range progress.Quests {
		if quest.QuestID == questID && quest.Status == domain.QuestStatusCompleted {
			return true
		}
	}

	return false
}
