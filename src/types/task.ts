export type TaskStep = {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
};

/** 任务运行状态：进行中 / 已暂停（用于多任务工作台与抽屉） */
export type TaskRunState = 'active' | 'paused';

export type TaskPlan = {
  id: string;
  title: string;
  goal: string;
  steps: TaskStep[];
  status: 'planning' | 'active' | 'completed';
  createdAt: number;
  /** 是否暂停（不占用「当前聚焦」时仍可保留在列表） */
  runState?: TaskRunState;
  /** 0–100，用于卡片进度条展示 */
  progress?: number;
  /** 卡片副标题，如 "AI：正在生成模块拆分…"、"等待你的输入" */
  statusLabel?: string;
};
