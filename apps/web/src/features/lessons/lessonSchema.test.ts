import { describe, expect, it } from "vitest";
import helloWorldLessonJson from "../../../../../content/lessons/hello-world.json";
import { parseLessonContent, validateLessonContent } from "./lessonSchema";

describe("lesson schema", () => {
  it("accepts the Hello World lesson content file", () => {
    const result = validateLessonContent(helloWorldLessonJson);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lesson.id).toBe("hello-world-001");
      expect(result.lesson.questId).toBe("hello-gopher");
      expect(result.lesson.syntax.language).toBe("go");
      expect(result.lesson.hints).toHaveLength(3);
    }
  });

  it("rejects invalid content with useful error messages", () => {
    const result = validateLessonContent({
      id: "",
      title: "Missing fields",
      hints: ["too few"],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("id must be a non-empty string");
      expect(result.errors).toContain("questId must be a non-empty string");
      expect(result.errors).toContain(
        "hints must contain at least 3 text item(s)",
      );
    }
  });

  it("throws when parsing invalid content", () => {
    expect(() => parseLessonContent({ id: "broken" })).toThrow(
      "Invalid lesson content",
    );
  });
});
