import {
  CheckCircle2,
  Lightbulb,
  Play,
  RotateCcw,
  Send,
  Terminal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LessonContent } from "../lessons/types";
import {
  loadChallengeDraft,
  resetChallengeDraft,
  saveChallengeDraft,
} from "./challengeDraftStorage";
import { getVisibleHints, revealNextHint, resetHints } from "./hintProgression";
import { MonacoCodeEditor } from "./MonacoCodeEditor";
import { runMockGoChallenge } from "./mockRunner";
import { createSubmissionStateFromRunResult } from "./submissionState";
import type { SubmissionState } from "./types";

export type ChallengePanelProps = {
  lesson: LessonContent;
  onClose: () => void;
  onSubmitPassed: () => void;
};

export function ChallengePanel({
  lesson,
  onClose,
  onSubmitPassed,
}: ChallengePanelProps) {
  const [sourceCode, setSourceCode] = useState(() =>
    loadChallengeDraft(window.localStorage, lesson.id, lesson.starterCode),
  );
  const [revealedHintCount, setRevealedHintCount] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });
  const visibleHints = useMemo(
    () => getVisibleHints(lesson.hints, revealedHintCount),
    [lesson.hints, revealedHintCount],
  );

  useEffect(() => {
    saveChallengeDraft(window.localStorage, lesson.id, sourceCode);
  }, [lesson.id, sourceCode]);

  const handleCodeChange = useCallback((nextSourceCode: string) => {
    setSourceCode(nextSourceCode);
    setSubmissionState({ status: "idle" });
  }, []);

  const handleResetCode = useCallback(() => {
    setSourceCode(
      resetChallengeDraft(window.localStorage, lesson.id, lesson.starterCode),
    );
    setRevealedHintCount(resetHints());
    setSubmissionState({ status: "idle" });
  }, [lesson.id, lesson.starterCode]);

  const handleRevealHint = useCallback(() => {
    setRevealedHintCount((currentCount) =>
      revealNextHint(lesson.hints, currentCount),
    );
  }, [lesson.hints]);

  const handleRun = useCallback(() => {
    const result = runMockGoChallenge(sourceCode, lesson.expectedOutput);
    setSubmissionState(createSubmissionStateFromRunResult(result));
  }, [lesson.expectedOutput, sourceCode]);

  const handleSubmit = useCallback(() => {
    const result = runMockGoChallenge(sourceCode, lesson.expectedOutput);
    setSubmissionState(createSubmissionStateFromRunResult(result));

    if (result.status === "passed") {
      onSubmitPassed();
    }
  }, [lesson.expectedOutput, onSubmitPassed, sourceCode]);

  useEffect(() => {
    function handleRunShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleRun();
      }
    }

    window.addEventListener("keydown", handleRunShortcut);

    return () => {
      window.removeEventListener("keydown", handleRunShortcut);
    };
  }, [handleRun]);

  return (
    <section
      className="pointer-events-auto absolute inset-3 z-40 grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-md border border-white/15 bg-ink/96 text-white shadow-2xl backdrop-blur"
      aria-label="Coding Challenge"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase text-skyglass">
            Coding Challenge
          </p>
          <h2 className="mt-1 text-xl font-bold">{lesson.challenge.title}</h2>
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
          aria-label="ปิด Challenge"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="grid min-h-0 gap-0 lg:grid-cols-[380px_1fr]">
        <aside className="min-h-0 overflow-y-auto border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
          <p className="text-sm leading-7 text-white/82">
            {lesson.challenge.objective}
          </p>

          <section className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase text-white/55">
              Expected Output
            </p>
            <code className="mt-2 block text-sm font-bold text-[#8fe08f]">
              {lesson.expectedOutput}
            </code>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-bold text-skyglass">ตัวอย่าง</h3>
            {lesson.publicExamples.map((example) => (
              <article
                key={`${example.input}-${example.output}`}
                className="mt-3 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/78"
              >
                <p>Input: {example.input}</p>
                <p>Output: {example.output}</p>
                <p className="mt-2 text-white/55">{example.note}</p>
              </article>
            ))}
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-skyglass">Hint</h3>
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-skyglass"
                disabled={revealedHintCount >= lesson.hints.length}
                onClick={handleRevealHint}
              >
                <Lightbulb size={16} aria-hidden="true" />
                เปิด Hint
              </button>
            </div>
            {visibleHints.length > 0 ? (
              <ol className="mt-3 grid gap-2">
                {visibleHints.map((hint, index) => (
                  <li
                    key={hint}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-white/78"
                  >
                    <span className="font-bold text-skyglass">
                      Hint {index + 1}:{" "}
                    </span>
                    {hint}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm leading-6 text-white/55">
                ลองคิดเองก่อน ถ้าติดค่อยเปิด Hint ทีละระดับ
              </p>
            )}
          </section>
        </aside>

        <div className="min-h-0 p-4">
          <MonacoCodeEditor
            language="go"
            value={sourceCode}
            onChange={handleCodeChange}
          />
        </div>
      </div>

      <footer className="grid gap-3 border-t border-white/10 bg-[#101722] p-4 lg:grid-cols-[1fr_auto]">
        <ConsolePanel submissionState={submissionState} />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
            onClick={handleResetCode}
          >
            <RotateCcw size={17} aria-hidden="true" />
            Reset Code
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-skyglass focus:outline-none focus:ring-2 focus:ring-skyglass"
            title="Run (Ctrl/⌘ + Enter)"
            onClick={handleRun}
          >
            <Play size={17} aria-hidden="true" />
            Run
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-moss px-4 py-2 text-sm font-bold text-white transition hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-skyglass"
            onClick={handleSubmit}
          >
            <Send size={17} aria-hidden="true" />
            Submit
          </button>
        </div>
      </footer>
    </section>
  );
}

function ConsolePanel({
  submissionState,
}: {
  submissionState: SubmissionState;
}) {
  if (submissionState.status === "idle") {
    return (
      <div className="flex min-h-20 items-center gap-3 text-sm text-white/60">
        <Terminal size={18} aria-hidden="true" />
        กด Run เพื่อดูผลแบบ mock หรือ Submit เพื่อส่งภารกิจ
      </div>
    );
  }

  const isPassed = submissionState.status === "passed";

  return (
    <div className="min-h-20 text-sm leading-6">
      <div
        className={`flex items-center gap-2 font-bold ${
          isPassed ? "text-[#8fe08f]" : "text-[#f7d06a]"
        }`}
      >
        {isPassed ? (
          <CheckCircle2 size={18} aria-hidden="true" />
        ) : (
          <Terminal size={18} aria-hidden="true" />
        )}
        {isPassed ? "Passed" : "Needs Work"}
      </div>
      <p className="mt-2 text-white/78">{submissionState.message}</p>
      <p className="mt-1 text-white/55">
        stdout: {submissionState.stdout || "(ไม่มี output)"}
      </p>
    </div>
  );
}
