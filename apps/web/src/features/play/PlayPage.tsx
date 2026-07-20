import { Home, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { LessonPanel } from "../lessons/LessonPanel";
import { getLessonByQuestId } from "../lessons/lessonRegistry";
import { DialogueBox } from "../quests/DialogueBox";
import { QuestPanel } from "../quests/QuestPanel";
import { professorGopher, firstQuest } from "../quests/questData";
import {
  acceptQuest,
  completeQuest,
  getQuestStatus,
} from "../quests/questProgress";
import {
  loadQuestProgress,
  resetQuestProgress,
  saveQuestProgress,
} from "../quests/questStorage";
import { PhaserGame } from "../../game/PhaserGame";
import type {
  GameDebugState,
  NpcInteractEvent,
  NpcInteractionState,
} from "../../game/events";

const ChallengePanel = lazy(() =>
  import("../editor/ChallengePanel").then((module) => ({
    default: module.ChallengePanel,
  })),
);

type PlayPageProps = {
  onNavigateHome: () => void;
};

type DialogueSession = {
  npcId: string;
  currentIndex: number;
};

export function PlayPage({ onNavigateHome }: PlayPageProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [debugState, setDebugState] = useState<GameDebugState | null>(null);
  const [interactionState, setInteractionState] =
    useState<NpcInteractionState | null>(null);
  const [dialogueSession, setDialogueSession] =
    useState<DialogueSession | null>(null);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [questProgress, setQuestProgress] = useState(() =>
    loadQuestProgress(window.localStorage),
  );
  const questStatus = getQuestStatus(questProgress, firstQuest);
  const lesson = getLessonByQuestId(firstQuest.id);
  const dialogueLines = useMemo(() => {
    if (questStatus === "completed") {
      return professorGopher.completedDialogue;
    }

    return professorGopher.dialogue;
  }, [questStatus]);

  const openProfessorDialogue = useCallback((npcId: string) => {
    if (npcId !== professorGopher.id) {
      return;
    }

    setDialogueSession((currentSession) => {
      if (currentSession) {
        return currentSession;
      }

      return {
        npcId,
        currentIndex: 0,
      };
    });
  }, []);

  const handleNpcInteractionChange = useCallback(
    (nextInteractionState: NpcInteractionState) => {
      setInteractionState(
        nextInteractionState.isNearby ? nextInteractionState : null,
      );
    },
    [],
  );

  const handleNpcInteract = useCallback((event: NpcInteractEvent) => {
    openProfessorDialogue(event.npcId);
  }, [openProfessorDialogue]);

  useEffect(() => {
    function handleKeyboardInteraction(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== "e" ||
        !interactionState ||
        dialogueSession ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      openProfessorDialogue(interactionState.npcId);
    }

    window.addEventListener("keydown", handleKeyboardInteraction);

    return () => {
      window.removeEventListener("keydown", handleKeyboardInteraction);
    };
  }, [dialogueSession, interactionState, openProfessorDialogue]);

  const handleAcceptQuest = useCallback(() => {
    setQuestProgress((currentProgress) => {
      const nextProgress = acceptQuest(currentProgress, firstQuest.id);
      saveQuestProgress(window.localStorage, nextProgress);
      return nextProgress;
    });
    setDialogueSession(null);
    setIsLessonOpen(true);
  }, []);

  const handleResetProgress = useCallback(() => {
    setQuestProgress(resetQuestProgress(window.localStorage));
    setDialogueSession(null);
    setIsLessonOpen(false);
    setIsChallengeOpen(false);
  }, []);

  const handleChallengePassed = useCallback(() => {
    setQuestProgress((currentProgress) => {
      const nextProgress = completeQuest(currentProgress, firstQuest.id);
      saveQuestProgress(window.localStorage, nextProgress);
      return nextProgress;
    });
  }, []);

  const handleDialogueBack = useCallback(() => {
    setDialogueSession((currentSession) =>
      currentSession
        ? {
            ...currentSession,
            currentIndex: Math.max(currentSession.currentIndex - 1, 0),
          }
        : null,
    );
  }, []);

  const handleDialogueNext = useCallback(() => {
    setDialogueSession((currentSession) =>
      currentSession
        ? {
            ...currentSession,
            currentIndex: Math.min(
              currentSession.currentIndex + 1,
              dialogueLines.length - 1,
            ),
          }
        : null,
    );
  }, [dialogueLines.length]);

  const currentDialogueIndex = Math.min(
    dialogueSession?.currentIndex ?? 0,
    dialogueLines.length - 1,
  );

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
          <PhaserGame
            onDebugStateChange={setDebugState}
            onNpcInteractionChange={handleNpcInteractionChange}
            onNpcInteract={handleNpcInteract}
          />
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

          <div className="absolute right-4 top-4">
            <QuestPanel
              quest={firstQuest}
              status={questStatus}
              hasLesson={Boolean(lesson)}
              onOpenLesson={() => setIsLessonOpen(true)}
              onOpenChallenge={() => setIsChallengeOpen(true)}
              onResetProgress={handleResetProgress}
            />
          </div>

          {interactionState && !dialogueSession ? (
            <div className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-white/15 bg-ink/90 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur">
              <MessageCircle size={18} className="text-skyglass" aria-hidden="true" />
              {interactionState.prompt}
            </div>
          ) : null}

          <div className="pointer-events-none absolute bottom-4 left-4 max-w-xl rounded-md border border-white/15 bg-ink/85 px-4 py-3 text-sm font-semibold text-white/90 shadow-lg backdrop-blur">
            {getVillageHint(questStatus)}
          </div>

          {dialogueSession ? (
            <DialogueBox
              lines={dialogueLines}
              currentIndex={currentDialogueIndex}
              quest={firstQuest}
              questStatus={questStatus}
              onBack={handleDialogueBack}
              onNext={handleDialogueNext}
              onAcceptQuest={handleAcceptQuest}
              onClose={() => setDialogueSession(null)}
            />
          ) : null}

          {isLessonOpen && lesson ? (
            <LessonPanel lesson={lesson} onClose={() => setIsLessonOpen(false)} />
          ) : null}

          {isChallengeOpen && lesson ? (
            <Suspense fallback={<ChallengeLoadingPanel />}>
              <ChallengePanel
                lesson={lesson}
                onClose={() => setIsChallengeOpen(false)}
                onSubmitPassed={handleChallengePassed}
              />
            </Suspense>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function getVillageHint(status: ReturnType<typeof getQuestStatus>) {
  if (status === "available") {
    return "เดินไปหา Professor Gopher แล้วกด E เพื่อรับภารกิจแรก";
  }

  if (status === "active") {
    return "Quest Active: เตรียมเปิดบทเรียน Hello World และ Code Editor ใน Goal ถัดไป";
  }

  if (status === "completed") {
    return "Professor Gopher เห็นความคืบหน้าของคุณแล้ว บทถัดไปกำลังรออยู่";
  }

  return "สำรวจ Beginner Village เพื่อปลดล็อกภารกิจแรก";
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

function ChallengeLoadingPanel() {
  return (
    <section className="pointer-events-auto absolute inset-3 z-40 grid place-items-center rounded-md border border-white/15 bg-ink/96 text-white shadow-2xl backdrop-blur">
      <p className="text-sm font-semibold text-skyglass">
        กำลังเปิด Code Editor...
      </p>
    </section>
  );
}
