import helloWorldLessonJson from "../../../../../content/lessons/hello-world.json";
import { parseLessonContent } from "./lessonSchema";
import type { LessonContent } from "./types";

export const helloWorldLesson = parseLessonContent(helloWorldLessonJson);

const lessonByQuestId = new Map<string, LessonContent>([
  [helloWorldLesson.questId, helloWorldLesson],
]);

export function getLessonByQuestId(questId: string): LessonContent | undefined {
  return lessonByQuestId.get(questId);
}
