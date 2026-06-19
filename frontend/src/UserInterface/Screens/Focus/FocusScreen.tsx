'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Pause, Square, SkipForward, RotateCcw, CheckSquare, CircleCheck } from 'lucide-react';
import { Sidebar } from '@ui/Components/Layout/Sidebar';
import { TaskSidebar } from '@ui/Components/Task/TaskSidebar';
import { useTasks } from '@ui/Hooks/Task/useTasks';
import { useFocusConfig } from '@ui/Hooks/Focus/useFocusConfig';
import { useFocusTimer } from '@ui/Hooks/Focus/useFocusTimer';
import { useFocusTime } from '@ui/Hooks/Focus/useFocusTime';

const FOCUS_PRESETS = [20, 25, 30, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function FocusScreen() {
  const searchParams = useSearchParams();
  const { tasks, toggleTask, createTask, updateTask, postponeTask, reorderTask, deleteTask } = useTasks();
  const { config, update } = useFocusConfig();
  const { phase, secondsLeft, start, pause, resume, stop, complete, skipBreak, restart } = useFocusTimer(
    config.focusDuration,
    config.breakDuration,
  );

  const taskIdParam = searchParams.get('taskId');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const { createFocusTime } = useFocusTime();
  const prevPhaseRef = useRef(phase);

  // Réagit à chaque changement de taskId dans l'URL (navigation depuis la sidebar)
  useEffect(() => {
    if (!taskIdParam) return;
    setSelectedTaskId(Number(taskIdParam));
    if (phase === 'idle') start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskIdParam]);

  // Sauvegarder la session quand le timer focus atteint 0
  useEffect(() => {
    if (prevPhaseRef.current === 'focusing' && phase === 'break') {
      createFocusTime({
        duration: config.focusDuration,
        ...(selectedTaskId !== null && { taskId: selectedTaskId }),
      });
    }
    prevPhaseRef.current = phase;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompleteDuringFocus = () => {
    const elapsed = Math.max(1, Math.round((config.focusDuration * 60 - secondsLeft) / 60));
    setSessionMinutes(elapsed);
    createFocusTime({
      duration: elapsed,
      ...(selectedTaskId !== null && { taskId: selectedTaskId }),
    });
    complete();
  };

  const handleTaskDone = () => {
    if (!selectedTask) return;
    const elapsed = Math.max(1, Math.round((config.focusDuration * 60 - secondsLeft) / 60));
    createFocusTime({ duration: elapsed, taskId: selectedTask.id });
    toggleTask(selectedTask.id);
    restart();
  };

  const todayTasks = tasks.filter((t) => !t.scheduledFor || t.scheduledFor === 'today');
  const pendingTasks = todayTasks.filter((t) => !t.done);
  const pendingCount = pendingTasks.length;
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const totalSeconds = phase === 'break' ? config.breakDuration * 60 : config.focusDuration * 60;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // --- IDLE ---
  if (phase === 'idle') {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="flex items-start justify-between px-8 pt-7 pb-5">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Mode Focus</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Choisissez une tâche et configurez votre session.
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground"
            >
              <CheckSquare size={15} />
              <span>Tâches</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex justify-center px-8 pb-8">
          <div className="w-full max-w-md space-y-5">

            {/* Task selector */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
                Tâche du moment
              </p>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-subtle-foreground">Aucune tâche en cours aujourd'hui.</p>
              ) : (
                <ul className="space-y-2">
                  {pendingTasks.map((task) => (
                    <li key={task.id}>
                      <button
                        onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedTaskId === task.id
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-border bg-elevated text-muted-foreground hover:border-accent/40 hover:text-foreground'
                        }`}
                      >
                        {task.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Config */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-subtle-foreground">
                Configuration
              </p>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs text-subtle-foreground">Durée de focus</p>
                  <div className="flex gap-2">
                    {FOCUS_PRESETS.map((min) => (
                      <button
                        key={min}
                        onClick={() => update({ focusDuration: min })}
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                          config.focusDuration === min
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-elevated text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {min}min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-subtle-foreground">Durée de pause</p>
                  <div className="flex gap-2">
                    {BREAK_PRESETS.map((min) => (
                      <button
                        key={min}
                        onClick={() => update({ breakDuration: min })}
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                          config.breakDuration === min
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-elevated text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {min}min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={start}
              className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Démarrer le focus
            </button>
          </div>
          </div>
        </main>

        <TaskSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          tasks={tasks}
          onToggle={toggleTask}
          onAdd={(title, description, priority, estimatedTime) =>
            createTask(title, description, priority, estimatedTime, 'today')
          }
          onDelete={deleteTask}
          onUpdate={updateTask}
          onReorder={reorderTask}
          onPostpone={postponeTask}
        />
      </div>
    );
  }

  // --- DONE ---
  if (phase === 'done') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
          <span className="text-2xl text-green-400">✓</span>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Session terminée !</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessionMinutes ?? config.focusDuration} minutes de focus
            {selectedTask && (
              <> sur <span className="font-medium text-foreground">« {selectedTask.title} »</span></>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          {selectedTask && (
            <button
              onClick={() => { toggleTask(selectedTask.id); setSessionMinutes(null); restart(); }}
              className="rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
            >
              Marquer comme faite
            </button>
          )}
          <button
            onClick={() => { setSessionMinutes(null); restart(); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw size={14} />
            Nouvelle session
          </button>
        </div>
      </div>
    );
  }

  // --- FOCUSING / PAUSED / BREAK ---
  const isBreak = phase === 'break';
  const isPaused = phase === 'paused';

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-background text-foreground">
      <p className="text-[10px] font-medium uppercase tracking-widest text-subtle-foreground">
        {isBreak ? 'Pause' : isPaused ? 'En pause' : 'Focus'}
      </p>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="240" height="240" className="-rotate-90">
          <circle
            cx="120" cy="120" r={RADIUS}
            fill="none" stroke="currentColor" strokeWidth="3"
            className="text-elevated"
          />
          <circle
            cx="120" cy="120" r={RADIUS}
            fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isBreak ? 'text-green-400' : 'text-accent'}`}
          />
        </svg>

        <div className="absolute flex flex-col items-center gap-1.5">
          <span className="text-4xl font-bold tabular-nums text-foreground">
            {formatTime(secondsLeft)}
          </span>
          {isBreak ? (
            <span className="text-xs text-subtle-foreground">Reposez-vous</span>
          ) : selectedTask ? (
            <span className="max-w-[160px] truncate text-center text-xs text-muted-foreground">
              {selectedTask.title}
            </span>
          ) : null}
        </div>
      </div>

      {/* Controls — chaque slot fait h-14 w-14 pour un alignement homogène */}
      <div className="flex items-center gap-4">
        {/* Stop */}
        <div className="group/stop relative flex h-14 w-14 items-center justify-center">
          <button
            onClick={stop}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-400"
            aria-label="Arrêter"
          >
            <Square size={14} fill="currentColor" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/stop:opacity-100">
            Arrêter
          </span>
        </div>

        {/* Play / Pause / Skip */}
        {isBreak ? (
          <div className="group/skip relative">
            <button
              onClick={skipBreak}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-colors hover:bg-green-600"
              aria-label="Passer la pause"
            >
              <SkipForward size={20} />
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/skip:opacity-100">
              Passer la pause
            </span>
          </div>
        ) : isPaused ? (
          <div className="group/resume relative">
            <button
              onClick={resume}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover"
              aria-label="Reprendre"
            >
              <Play size={20} fill="currentColor" />
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/resume:opacity-100">
              Reprendre
            </span>
          </div>
        ) : (
          <div className="group/pause relative">
            <button
              onClick={pause}
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover"
              aria-label="Mettre en pause"
            >
              <Pause size={20} fill="currentColor" />
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/pause:opacity-100">
              Mettre en pause
            </span>
          </div>
        )}

        {/* Terminer la session */}
        <div className="flex h-14 w-14 items-center justify-center">
          {!isBreak && (
            <div className="group/complete relative flex items-center justify-center">
              <button
                onClick={handleCompleteDuringFocus}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-green-400 transition-colors hover:bg-green-500/20 hover:text-green-300"
                aria-label="Terminer la session"
              >
                <CircleCheck size={16} />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/complete:opacity-100">
                Terminer la session
              </span>
            </div>
          )}
        </div>

        {/* Tâche accomplie */}
        <div className="flex h-14 w-14 items-center justify-center">
          {!isBreak && selectedTask && (
            <div className="group/taskdone relative flex items-center justify-center">
              <button
                onClick={handleTaskDone}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent transition-colors hover:bg-accent/20 hover:text-accent-hover"
                aria-label="Tâche accomplie"
              >
                <CheckSquare size={16} />
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity z-20 group-hover/taskdone:opacity-100">
                Tâche accomplie
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
