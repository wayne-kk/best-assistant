import { create } from 'zustand';
import type { TaskPlan, TaskStep, TaskRunState } from '../types/task';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/id';

const DEFAULT_RUN_STATE: TaskRunState = 'active';

type TaskState = {
  tasks: TaskPlan[];
  currentTaskId: string | null;
  currentStepId: string | null;
  loadFromStorage: () => Promise<void>;
  setCurrentTask: (taskId: string | null) => void;
  setCurrentStep: (stepId: string | null) => void;
  addTask: (plan: Omit<TaskPlan, 'id' | 'createdAt'>) => TaskPlan;
  setTaskFromServer: (plan: TaskPlan) => void;
  updateTask: (id: string, patch: Partial<TaskPlan>) => void;
  updateStep: (taskId: string, stepId: string, patch: Partial<TaskStep>) => void;
  setTaskRunState: (taskId: string, runState: TaskRunState) => void;
  setTaskProgress: (taskId: string, progress: number, statusLabel?: string) => void;
  getActiveTask: () => TaskPlan | null;
  getCurrentStep: () => TaskStep | null;
  getActiveTasks: () => TaskPlan[];
  getPausedTasks: () => TaskPlan[];
  advanceCurrentStep: () => { completed: boolean; nextStep?: TaskStep } | null;
  persist: () => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTaskId: null,
  currentStepId: null,

  loadFromStorage: async () => {
    const [rawTasks, currentTaskId, currentStepId] = await Promise.all([
      storage.get<TaskPlan[]>(STORAGE_KEYS.TASKS),
      storage.get<string | null>(STORAGE_KEYS.CURRENT_TASK_ID),
      storage.get<string | null>(STORAGE_KEYS.CURRENT_STEP_ID),
    ]);
    const tasks = (rawTasks ?? []).map((t) => ({
      ...t,
      runState: (t.runState ?? 'active') as TaskRunState,
    }));
    set({
      tasks,
      currentTaskId: currentTaskId ?? null,
      currentStepId: currentStepId ?? null,
    });
  },

  setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

  setCurrentStep: (stepId) => set({ currentStepId: stepId }),

  addTask: (plan) => {
    const task: TaskPlan = {
      ...plan,
      id: generateId(),
      createdAt: Date.now(),
      runState: DEFAULT_RUN_STATE,
      progress: plan.progress ?? 0,
      statusLabel: plan.statusLabel,
    };
    set((s) => ({
      tasks: [task, ...s.tasks],
      currentTaskId: task.id,
      currentStepId: task.steps[0]?.id ?? null,
    }));
    return task;
  },

  setTaskFromServer: (plan) => {
    const doingStep = plan.steps.find((s) => s.status === 'doing');
    const withRunState: TaskPlan = { ...plan, runState: plan.runState ?? DEFAULT_RUN_STATE };
    set((s) => ({
      tasks: [withRunState, ...s.tasks.filter((t) => t.id !== plan.id)],
      currentTaskId: plan.id,
      currentStepId: doingStep?.id ?? plan.steps[0]?.id ?? null,
    }));
  },

  updateTask: (id, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  },

  updateStep: (taskId, stepId, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              steps: t.steps.map((st) =>
                st.id === stepId ? { ...st, ...patch } : st
              ),
            }
          : t
      ),
    }));
  },

  setTaskRunState: (taskId, runState) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, runState } : t)),
      ...(runState === 'active' ? { currentTaskId: taskId } : {}),
    }));
  },

  setTaskProgress: (taskId, progress, statusLabel) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, progress, ...(statusLabel !== undefined ? { statusLabel } : {}) }
          : t
      ),
    }));
  },

  getActiveTask: () => {
    const { tasks, currentTaskId } = get();
    return tasks.find((t) => t.id === currentTaskId) ?? null;
  },

  getActiveTasks: () => {
    return get().tasks.filter((t) => (t.runState ?? 'active') === 'active' && t.status !== 'completed');
  },

  getPausedTasks: () => {
    return get().tasks.filter((t) => t.runState === 'paused');
  },

  getCurrentStep: () => {
    const task = get().getActiveTask();
    const { currentStepId } = get();
    if (!task || !currentStepId) return null;
    return task.steps.find((s) => s.id === currentStepId) ?? null;
  },

  advanceCurrentStep: () => {
    const task = get().getActiveTask();
    const { currentStepId } = get();
    if (!task || !currentStepId) return null;
    const idx = task.steps.findIndex((s) => s.id === currentStepId);
    if (idx < 0) return null;
    const current = task.steps[idx];
    const next = task.steps[idx + 1];
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id !== task.id
          ? t
          : {
              ...t,
              steps: t.steps.map((st, i) => {
                if (st.id !== currentStepId && (!next || st.id !== next.id))
                  return st;
                if (st.id === currentStepId) return { ...st, status: 'done' as const };
                if (next && st.id === next.id)
                  return { ...st, status: 'doing' as const };
                return st;
              }),
              status: !next ? ('completed' as const) : t.status,
            }
      ),
      currentStepId: next?.id ?? null,
    }));
    if (!next) return { completed: true };
    const updated = get().tasks.find((t) => t.id === task.id);
    const nextStep = updated?.steps.find((s) => s.id === next.id);
    return { completed: false, nextStep: nextStep ?? next };
  },

  persist: async () => {
    const s = get();
    await Promise.all([
      storage.set(STORAGE_KEYS.TASKS, s.tasks),
      storage.set(STORAGE_KEYS.CURRENT_TASK_ID, s.currentTaskId),
      storage.set(STORAGE_KEYS.CURRENT_STEP_ID, s.currentStepId),
    ]);
  },
}));
