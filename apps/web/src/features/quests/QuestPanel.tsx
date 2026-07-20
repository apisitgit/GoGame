import { CheckCircle2, CircleDot, Lock, RotateCcw, ScrollText } from "lucide-react";
import type { QuestDefinition, QuestStatus } from "./types";

type QuestPanelProps = {
  quest: QuestDefinition;
  status: QuestStatus;
  onResetProgress: () => void;
};

const statusCopy: Record<
  QuestStatus,
  { label: string; description: string; className: string }
> = {
  locked: {
    label: "Locked",
    description: "ยังไม่ปลดล็อก",
    className: "text-white/55",
  },
  available: {
    label: "Available",
    description: "พร้อมรับภารกิจ",
    className: "text-skyglass",
  },
  active: {
    label: "Active",
    description: "กำลังทำภารกิจ",
    className: "text-[#f7d06a]",
  },
  completed: {
    label: "Completed",
    description: "สำเร็จแล้ว",
    className: "text-[#8fe08f]",
  },
};

export function QuestPanel({ quest, status, onResetProgress }: QuestPanelProps) {
  const copy = statusCopy[status];

  return (
    <aside className="pointer-events-auto w-80 rounded-md border border-white/15 bg-ink/90 p-4 text-white shadow-lg backdrop-blur">
      <div className="flex items-start gap-3">
        <ScrollText className="mt-0.5 text-skyglass" size={20} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-white/55">Quest</p>
          <h2 className="mt-1 text-base font-bold leading-6">{quest.title}</h2>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/80">{quest.objective}</p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <div>
            <p className={`text-sm font-bold ${copy.className}`}>{copy.label}</p>
            <p className="text-xs text-white/55">{copy.description}</p>
          </div>
        </div>
        <p className="text-sm font-bold text-white">{quest.rewardExp} EXP</p>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
        onClick={onResetProgress}
      >
        <RotateCcw size={16} aria-hidden="true" />
        Reset Progress
      </button>
    </aside>
  );
}

function getStatusIcon(status: QuestStatus) {
  if (status === "locked") {
    return <Lock size={18} className="text-white/55" aria-hidden="true" />;
  }

  if (status === "completed") {
    return <CheckCircle2 size={18} className="text-[#8fe08f]" aria-hidden="true" />;
  }

  return <CircleDot size={18} className="text-skyglass" aria-hidden="true" />;
}
