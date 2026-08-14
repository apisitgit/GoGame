import {
  BadgeCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { PlayerProgressResponse } from "../../shared/api/progress";

type ProgressionPanelProps = {
  progress: PlayerProgressResponse | null;
};

export function ProgressionPanel({ progress }: ProgressionPanelProps) {
  const level = progress?.level.level ?? 1;
  const totalExp = progress?.totalExp ?? 0;
  const progressPercent = progress?.level.progressPercent ?? 0;
  const expToNext = progress?.level.expToNextLevel ?? 100;
  const unlockedAchievements =
    progress?.achievements.filter((achievement) => achievement.status === "unlocked") ??
    [];
  const visibleSkills = progress?.skillTree.slice(0, 6) ?? [];

  return (
    <aside className="pointer-events-auto w-80 rounded-md border border-white/15 bg-ink/90 p-4 text-white shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-skyglass/80">
            Player Progress
          </p>
          <h2 className="mt-1 text-lg font-bold">Level {level}</h2>
        </div>
        <div className="inline-flex size-10 items-center justify-center rounded-md bg-moss text-white">
          <Sparkles size={19} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white/85">{totalExp} EXP</span>
          <span className="text-white/55">อีก {expToNext} EXP</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-sm bg-white/12">
          <div
            className="h-full rounded-sm bg-[#8fe08f] transition-[width] duration-300"
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>
      </div>

      <section className="mt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-skyglass">
          <Trophy size={16} aria-hidden="true" />
          Achievement
        </div>
        {unlockedAchievements.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {unlockedAchievements.slice(0, 2).map((achievement) => (
              <li
                key={achievement.id}
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <p className="text-sm font-bold">{achievement.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/58">
                  {achievement.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-white/58">
            ผ่านภารกิจแรกเพื่อปลดล็อก Achievement
          </p>
        )}
      </section>

      <section className="mt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-skyglass">
          <BadgeCheck size={16} aria-hidden="true" />
          Skill Tree
        </div>
        {visibleSkills.length > 0 ? (
          <ol className="mt-3 grid gap-2">
            {visibleSkills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <SkillStatusIcon status={skill.status} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{skill.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/58">
                    {skill.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm leading-6 text-white/58">
            กำลังโหลด Skill Tree จาก backend
          </p>
        )}
      </section>
    </aside>
  );
}

function SkillStatusIcon({
  status,
}: {
  status: PlayerProgressResponse["skillTree"][number]["status"];
}) {
  if (status === "completed") {
    return <CheckCircle2 className="mt-0.5 shrink-0 text-[#8fe08f]" size={16} aria-hidden="true" />;
  }

  if (status === "unlocked") {
    return <Sparkles className="mt-0.5 shrink-0 text-skyglass" size={16} aria-hidden="true" />;
  }

  return <Lock className="mt-0.5 shrink-0 text-white/38" size={16} aria-hidden="true" />;
}
