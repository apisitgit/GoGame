import { BookOpen, ChevronRight, Lightbulb, X } from "lucide-react";
import type { LessonContent } from "./types";

type LessonPanelProps = {
  lesson: LessonContent;
  onClose: () => void;
};

export function LessonPanel({ lesson, onClose }: LessonPanelProps) {
  return (
    <section
      className="pointer-events-auto absolute inset-y-4 left-4 z-30 flex w-[min(760px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-white/15 bg-ink/95 text-white shadow-2xl backdrop-blur"
      aria-label="บทเรียน Go ภาษาไทย"
    >
      <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-semibold uppercase text-skyglass">
            Beginner Village Lesson
          </p>
          <h2 className="mt-1 text-xl font-bold">{lesson.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {lesson.objective.text}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
          aria-label="ปิดบทเรียน"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <section>
          <div className="flex items-center gap-2 text-skyglass">
            <BookOpen size={18} aria-hidden="true" />
            <h3 className="text-base font-bold">เรื่องราว</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {lesson.story.text}
          </p>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">{lesson.problem.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {lesson.problem.body}
          </p>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">แนวคิดสำคัญ</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {lesson.explanation.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-md border border-white/10 bg-white/[0.04] p-4"
              >
                <h4 className="text-sm font-bold text-skyglass">
                  {section.title}
                </h4>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">{lesson.visual.title}</h3>
          <ol className="mt-4 grid gap-2">
            {lesson.visual.steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/82"
              >
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-skyglass text-xs font-bold text-ink">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">ตัวอย่างโค้ด</h3>
          <pre className="mt-4 overflow-x-auto rounded-md border border-white/10 bg-[#101722] p-4 text-sm leading-6 text-[#d9f5d6]">
            <code>{lesson.syntax.code}</code>
          </pre>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">{lesson.challenge.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {lesson.challenge.objective}
          </p>
          <div className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase text-white/55">
              Expected Output
            </p>
            <code className="mt-2 block text-sm font-bold text-[#8fe08f]">
              {lesson.expectedOutput}
            </code>
          </div>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-skyglass">
            <Lightbulb size={18} aria-hidden="true" />
            <h3 className="text-base font-bold">Hint ตามลำดับ</h3>
          </div>
          <ol className="mt-4 grid gap-2">
            {lesson.hints.map((hint, index) => (
              <li
                key={hint}
                className="flex gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-white/82"
              >
                <span className="font-bold text-skyglass">Hint {index + 1}</span>
                <span>{hint}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">จุดที่มักพลาด</h3>
          <div className="mt-4 grid gap-3">
            {lesson.commonMistakes.map((item) => (
              <article
                key={item.mistake}
                className="rounded-md border border-white/10 bg-white/[0.04] p-4"
              >
                <h4 className="text-sm font-bold text-[#f7d06a]">
                  {item.mistake}
                </h4>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  {item.feedback}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-base font-bold">สรุปท้ายบท</h3>
          <p className="mt-3 text-sm leading-7 text-white/82">
            {lesson.summary}
          </p>
        </section>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-white/10 p-4 text-sm text-white/70">
        <span>Next unlock: {lesson.nextUnlock}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-skyglass">
          Code Editor จะมาใน Goal ถัดไป
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </footer>
    </section>
  );
}
