import { Activity, Play, ShieldCheck, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { PlayPage } from "../features/play/PlayPage";
import { fetchHealth } from "../shared/api/health";
import type { HealthState } from "../shared/api/types";

export function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    function syncPath() {
      setPath(window.location.pathname);
    }

    window.addEventListener("popstate", syncPath);
    window.addEventListener("go-quest:navigate", syncPath);

    return () => {
      window.removeEventListener("popstate", syncPath);
      window.removeEventListener("go-quest:navigate", syncPath);
    };
  }, []);

  if (path === "/play") {
    return <PlayPage onNavigateHome={() => navigateTo("/")} />;
  }

  return <HomePage onPlay={() => navigateTo("/play")} />;
}

function HomePage({ onPlay }: { onPlay: () => void }) {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      const nextHealth = await fetchHealth();
      if (!ignore) {
        setHealth(nextHealth);
      }
    }

    void loadHealth();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-parchment text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-moss">
              Thai Go Learning RPG
            </p>
            <h1 className="mt-1 text-4xl font-bold">Go Quest</h1>
          </div>
          <BackendStatus health={health} />
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="inline-flex items-center gap-2 rounded-md bg-skyglass px-3 py-2 text-sm font-semibold text-ink">
              <Swords size={18} aria-hidden="true" />
              Beginner Village กำลังจะเริ่ม
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-bold leading-tight">
              เกม RPG สำหรับเรียน Go จากปัญหาจริง ไม่ใช่จำ syntax อย่างเดียว
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/75">
              โครงแรกนี้เชื่อม frontend กับ backend ผ่าน health endpoint แล้ว
              เพื่อเตรียมต่อยอดเป็นแผนที่, NPC, quest, lesson และ code editor
              ใน Goal ถัดไป
            </p>
            <button
              type="button"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-moss px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-moss/90 focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2"
              onClick={onPlay}
            >
              <Play size={18} aria-hidden="true" />
              เข้า Beginner Village
            </button>
          </section>

          <section className="rounded-lg border border-ink/15 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-moss" size={24} aria-hidden="true" />
              <h2 className="text-xl font-bold">Security boundary</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
              <li>API จำกัด CORS ด้วย environment variable</li>
              <li>ยังไม่มีการรัน code ผู้เล่นใน API process</li>
              <li>ใช้ timeout และ security headers ตั้งแต่ foundation</li>
              <li>ค่าตั้งต้นทั้งหมดอยู่ใน `.env.example`</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}

function BackendStatus({ health }: { health: HealthState }) {
  const statusCopy = getStatusCopy(health);

  return (
    <div
      className="flex min-w-56 items-center gap-3 rounded-md border border-ink/15 bg-white px-4 py-3 shadow-sm"
      aria-live="polite"
    >
      <Activity className={statusCopy.iconClass} size={20} aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase text-ink/55">
          Backend Status
        </p>
        <p className={`text-sm font-bold ${statusCopy.textClass}`}>
          {statusCopy.label}
        </p>
      </div>
    </div>
  );
}

function getStatusCopy(health: HealthState) {
  if (health.status === "online") {
    return {
      label: `Online (${health.service})`,
      iconClass: "text-moss",
      textClass: "text-moss",
    };
  }

  if (health.status === "offline") {
    return {
      label: "Offline",
      iconClass: "text-ember",
      textClass: "text-ember",
    };
  }

  return {
    label: "Checking...",
    iconClass: "text-ink/50",
    textClass: "text-ink/60",
  };
}

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("go-quest:navigate"));
}
