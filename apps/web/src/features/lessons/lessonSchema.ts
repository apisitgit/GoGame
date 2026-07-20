import type {
  LessonCommonMistake,
  LessonContent,
  LessonPublicExample,
  LessonTextBlock,
  LessonValidationResult,
} from "./types";

export function validateLessonContent(
  value: unknown,
): LessonValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["lesson must be an object"] };
  }

  requireString(value, "id", errors);
  requireString(value, "questId", errors);
  requireString(value, "title", errors);
  requireString(value, "world", errors);
  requireStringArray(value, "concepts", errors, { minItems: 1 });
  requireTextBlock(value.story, "story", errors, { requireText: true });
  requireTextBlock(value.problem, "problem", errors, { requireBody: true });
  requireNestedString(value.objective, "objective.text", errors);
  requireExplanation(value.explanation, errors);
  requireVisual(value.visual, errors);
  requireSyntax(value.syntax, errors);
  requireString(value, "starterCode", errors);
  requireString(value, "expectedOutput", errors);
  requireChallenge(value.challenge, errors);
  requirePublicExamples(value.publicExamples, errors);
  requireStringArray(value, "hints", errors, { minItems: 3 });
  requireCommonMistakes(value.commonMistakes, errors);
  requireString(value, "summary", errors);
  requireString(value, "nextUnlock", errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, lesson: value as LessonContent };
}

export function parseLessonContent(value: unknown): LessonContent {
  const result = validateLessonContent(value);

  if (!result.ok) {
    throw new Error(`Invalid lesson content: ${result.errors.join("; ")}`);
  }

  return result.lesson;
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  errors: string[],
) {
  if (typeof record[key] !== "string" || record[key].trim().length === 0) {
    errors.push(`${key} must be a non-empty string`);
  }
}

function requireNestedString(
  value: unknown,
  path: string,
  errors: string[],
) {
  if (!isRecord(value)) {
    errors.push(`${path.split(".")[0]} must be an object`);
    return;
  }

  const key = path.split(".").at(-1);
  if (!key || typeof value[key] !== "string" || value[key].trim().length === 0) {
    errors.push(`${path} must be a non-empty string`);
  }
}

function requireStringArray(
  record: Record<string, unknown>,
  key: string,
  errors: string[],
  options: { minItems: number },
) {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    value.length < options.minItems ||
    value.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    errors.push(`${key} must contain at least ${options.minItems} text item(s)`);
  }
}

function requireTextBlock(
  value: unknown,
  path: string,
  errors: string[],
  options: { requireBody?: boolean; requireText?: boolean },
) {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  if (path === "story") {
    requireString(value, "npc", errors);
  }

  if (options.requireBody && !hasNonEmptyString(value.body)) {
    errors.push(`${path}.body must be a non-empty string`);
  }

  if (options.requireText && !hasNonEmptyString(value.text)) {
    errors.push(`${path}.text must be a non-empty string`);
  }

  if (path !== "story" && !hasNonEmptyString(value.title)) {
    errors.push(`${path}.title must be a non-empty string`);
  }
}

function requireExplanation(value: unknown, errors: string[]) {
  if (!isRecord(value) || !Array.isArray(value.sections)) {
    errors.push("explanation.sections must be an array");
    return;
  }

  if (value.sections.length === 0) {
    errors.push("explanation.sections must contain at least one section");
    return;
  }

  value.sections.forEach((section, index) => {
    if (!isLessonTextBlock(section, { requireTitle: true, requireBody: true })) {
      errors.push(`explanation.sections[${index}] must have title and body`);
    }
  });
}

function requireVisual(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("visual must be an object");
    return;
  }

  requireString(value, "title", errors);

  if (
    !Array.isArray(value.steps) ||
    value.steps.length === 0 ||
    value.steps.some((step) => typeof step !== "string" || step.trim().length === 0)
  ) {
    errors.push("visual.steps must contain at least one text step");
  }
}

function requireSyntax(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("syntax must be an object");
    return;
  }

  if (value.language !== "go") {
    errors.push("syntax.language must be go");
  }

  requireString(value, "code", errors);
}

function requireChallenge(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("challenge must be an object");
    return;
  }

  requireString(value, "title", errors);
  requireString(value, "objective", errors);
}

function requirePublicExamples(value: unknown, errors: string[]) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("publicExamples must contain at least one example");
    return;
  }

  value.forEach((example, index) => {
    if (!isPublicExample(example)) {
      errors.push(`publicExamples[${index}] must have input, output, and note`);
    }
  });
}

function requireCommonMistakes(value: unknown, errors: string[]) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("commonMistakes must contain at least one item");
    return;
  }

  value.forEach((mistake, index) => {
    if (!isCommonMistake(mistake)) {
      errors.push(`commonMistakes[${index}] must have mistake and feedback`);
    }
  });
}

function isLessonTextBlock(
  value: unknown,
  options: { requireTitle?: boolean; requireBody?: boolean },
): value is LessonTextBlock {
  if (!isRecord(value)) {
    return false;
  }

  if (options.requireTitle && !hasNonEmptyString(value.title)) {
    return false;
  }

  if (options.requireBody && !hasNonEmptyString(value.body)) {
    return false;
  }

  return true;
}

function isPublicExample(value: unknown): value is LessonPublicExample {
  return (
    isRecord(value) &&
    hasNonEmptyString(value.input) &&
    hasNonEmptyString(value.output) &&
    hasNonEmptyString(value.note)
  );
}

function isCommonMistake(value: unknown): value is LessonCommonMistake {
  return (
    isRecord(value) &&
    hasNonEmptyString(value.mistake) &&
    hasNonEmptyString(value.feedback)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
