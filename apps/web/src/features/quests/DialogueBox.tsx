import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DialogueLine, QuestDefinition, QuestStatus } from "./types";

type DialogueBoxProps = {
  lines: DialogueLine[];
  currentIndex: number;
  quest: QuestDefinition;
  questStatus: QuestStatus;
  onBack: () => void;
  onNext: () => void;
  onAcceptQuest: () => void;
  onClose: () => void;
};

export function DialogueBox({
  lines,
  currentIndex,
  quest,
  questStatus,
  onBack,
  onNext,
  onAcceptQuest,
  onClose,
}: DialogueBoxProps) {
  const line = lines[currentIndex];
  const isFirstLine = currentIndex === 0;
  const isLastLine = currentIndex === lines.length - 1;
  const canAcceptQuest = isLastLine && questStatus === "available";

  return (
    <section
      className="pointer-events-auto absolute inset-x-4 bottom-4 mx-auto max-w-3xl rounded-md border border-white/15 bg-ink/95 p-5 text-white shadow-2xl backdrop-blur"
      aria-label="บทสนทนา Professor Gopher"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-skyglass">
            {line.speaker}
          </p>
          <h2 className="mt-1 text-lg font-bold">{quest.title}</h2>
        </div>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
          aria-label="ปิดบทสนทนา"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-4 text-base leading-8 text-white/88">{line.text}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-sm text-white/60">
          {currentIndex + 1} / {lines.length}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isFirstLine}
            onClick={onBack}
          >
            <ChevronLeft size={17} aria-hidden="true" />
            ย้อนกลับ
          </button>

          {!isLastLine ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-skyglass focus:outline-none focus:ring-2 focus:ring-skyglass"
              onClick={onNext}
            >
              ถัดไป
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-moss px-4 py-2 text-sm font-bold text-white transition hover:bg-moss/90 disabled:cursor-not-allowed disabled:opacity-55 focus:outline-none focus:ring-2 focus:ring-skyglass"
              disabled={!canAcceptQuest}
              onClick={onAcceptQuest}
            >
              {questStatus === "active"
                ? "รับภารกิจแล้ว"
                : questStatus === "completed"
                  ? "ภารกิจสำเร็จแล้ว"
                  : "รับ Quest"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
