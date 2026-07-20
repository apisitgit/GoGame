export type LessonContent = {
  id: string;
  questId: string;
  title: string;
  world: string;
  concepts: string[];
  story: LessonTextBlock & {
    npc: string;
  };
  problem: LessonTextBlock;
  objective: {
    text: string;
  };
  explanation: {
    sections: LessonTextBlock[];
  };
  visual: {
    title: string;
    steps: string[];
  };
  syntax: {
    language: "go";
    code: string;
  };
  starterCode: string;
  expectedOutput: string;
  challenge: {
    title: string;
    objective: string;
  };
  publicExamples: LessonPublicExample[];
  hints: string[];
  commonMistakes: LessonCommonMistake[];
  summary: string;
  nextUnlock: string;
};

export type LessonTextBlock = {
  title: string;
  body?: string;
  text?: string;
};

export type LessonPublicExample = {
  input: string;
  output: string;
  note: string;
};

export type LessonCommonMistake = {
  mistake: string;
  feedback: string;
};

export type LessonValidationResult =
  | { ok: true; lesson: LessonContent }
  | { ok: false; errors: string[] };
