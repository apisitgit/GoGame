import { Home, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { PhaserGame } from "../../game/PhaserGame";
import type { GameDebugState } from "../../game/events";

type PlayPageProps = {
  onNavigateHome: () => void;
};

export function PlayPage({ onNavigateHome }: PlayPageProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [debugState, setDebugState] = useState<GameDebugState | null>(null);

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="grid min-h-screen grid-rows-[auto_1fr]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-ink px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-skyglass/80">
              Beginner Village
            </p>
            <h1 className="text-xl font-bold">หมู่บ้านเริ่มต้นของ Gopher</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-skyglass"
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled((enabled) => !enabled)}
            >
              {soundEnabled ? (
                <Volume2 size={18} aria-hidden="true" />
              ) : (
                <VolumeX size={18} aria-hidden="true" />
              )}
              {soundEnabled ? "เสียงเปิด" : "เสียงปิด"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-skyglass focus:outline-none focus:ring-2 focus:ring-skyglass"
              onClick={onNavigateHome}
            >
              <Home size={18} aria-hidden="true" />
              Home
            </button>
          </div>
        </header>

        <section className="relative min-h-0 overflow-hidden">
          <PhaserGame onDebugStateChange={setDebugState} />
          <output
            className="sr-only"
            data-testid="player-debug-state"
            aria-hidden="true"
          >
            {debugState ? JSON.stringify(debugState) : "pending"}
          </output>
          <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-md border border-white/15 bg-ink/85 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-bold text-skyglass">การควบคุม</p>
            <p className="mt-2 text-sm leading-6 text-white/85">
              เดินด้วย W A S D หรือปุ่มลูกศร กล้องจะตามตัวละคร และเดินทะลุขอบหมู่บ้านหรือสิ่งกีดขวางไม่ได้
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-white/15 bg-ink/85 px-4 py-3 text-sm font-semibold text-white/90 shadow-lg backdrop-blur">
            สำรวจพื้นที่ แล้วเตรียมพบ Professor Gopher ใน Goal ถัดไป
          </div>
        </section>
      </div>
    </main>
  );
}
