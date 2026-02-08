/**
 * MVP 用模拟 AI：无 BFF 时按 PRD 意图（目标型/推进型/调整型/问答）返回回复与任务操作
 */

import type { MessageBlock } from '../types/message';
import type { TaskPlan, TaskStep } from '../types/task';
import { generateId } from '../utils/id';

function textBlock(value: string): MessageBlock {
  return { type: 'text', value };
}

export type MockResponse = {
  blocks: MessageBlock[];
  task?: TaskPlan;
  /** 为 true 时由调用方执行 taskStore.advanceCurrentStep() */
  advanceStep?: boolean;
};

/** 模拟流式：按字延迟输出 */
export function mockStreamReply(
  fullText: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  intervalMs = 30
): () => void {
  let index = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    if (index < fullText.length) {
      onChunk(fullText[index]);
      index += 1;
      setTimeout(tick, intervalMs);
    } else {
      onDone();
    }
  };
  setTimeout(tick, intervalMs);
  return () => {
    cancelled = true;
  };
}

/** 是否为目标型意图：用户提出明确目标，需创建任务 */
function isGoalIntent(lower: string): boolean {
  const goalKeywords = [
    '规划', '计划', '帮我', '想要', '想准备', '准备一次', '准备一场',
    '旅行', '旅游', '日本', '健身', '减肥', '学习', '学一门', '写报告',
    '准备面试', '面试', '考证', '考试', '搬家', '装修', '婚礼',
  ];
  return goalKeywords.some((k) => lower.includes(k));
}

/** 是否为推进型意图：用户要推进当前任务（下一步 / 完成本步） */
function isAdvanceIntent(lower: string): boolean {
  const advanceKeywords = [
    '下一步', '然后呢', '然后', '然后呢', '这个步骤完成了', '完成了',
    '做完', '做好了', '搞定了', '弄好了', '继续',
  ];
  return advanceKeywords.some((k) => lower.includes(k));
}

/** 是否为调整型意图：用户希望调整计划（更简单/更紧等） */
function isAdjustIntent(lower: string): boolean {
  const adjustKeywords = [
    '计划太紧', '太紧了', '简单一点', '简单些', '时间不够', '能改一下',
    '改一下', '调整', '减少', '合并', '少一点', '精简',
  ];
  return adjustKeywords.some((k) => lower.includes(k));
}

/** 根据目标类型生成 3–7 个明确、可执行的步骤 */
function buildStepsForGoal(goal: string, title: string): TaskStep[] {
  const now = () => ({ id: generateId(), status: 'todo' as const });
  const lower = goal.toLowerCase();

  if (lower.includes('旅行') || lower.includes('旅游') || lower.includes('日本')) {
    const steps: TaskStep[] = [
      { ...now(), title: '确定出行时间与预算', description: '选好日期和大致预算范围', status: 'doing' },
      { ...now(), title: '办理签证与机票', description: '办签证、订机票', status: 'todo' },
      { ...now(), title: '预订住宿与行程', description: '订酒店、简单行程', status: 'todo' },
      { ...now(), title: '准备行李与当地信息', description: '换汇、清单、攻略', status: 'todo' },
    ];
    return steps;
  }
  if (lower.includes('健身') || lower.includes('减肥')) {
    const steps: TaskStep[] = [
      { ...now(), title: '确定目标与周期', description: '减重/增肌目标与时间', status: 'doing' },
      { ...now(), title: '制定训练与饮食计划', description: '每周几次、吃什么', status: 'todo' },
      { ...now(), title: '执行第一周并记录', description: '按计划执行并记录体重', status: 'todo' },
      { ...now(), title: '复盘并微调', description: '根据效果调整计划', status: 'todo' },
    ];
    return steps;
  }
  if (lower.includes('面试') || lower.includes('准备面试')) {
    const steps: TaskStep[] = [
      { ...now(), title: '梳理目标岗位与简历', description: '明确岗位要求、更新简历', status: 'doing' },
      { ...now(), title: '准备常见问题与话术', description: '自我介绍、项目经历、优缺点', status: 'todo' },
      { ...now(), title: '模拟面试与复盘', description: '找人或自录模拟、改短板', status: 'todo' },
    ];
    return steps;
  }
  if (lower.includes('报告') || lower.includes('写报告')) {
    const steps: TaskStep[] = [
      { ...now(), title: '确定主题与大纲', description: '主题、章节结构', status: 'doing' },
      { ...now(), title: '收集资料与数据', description: '文献、数据来源', status: 'todo' },
      { ...now(), title: '撰写初稿', description: '按大纲完成初稿', status: 'todo' },
      { ...now(), title: '修改与定稿', description: '润色、格式、提交', status: 'todo' },
    ];
    return steps;
  }
  if (lower.includes('学习') || lower.includes('学一门')) {
    const steps: TaskStep[] = [
      { ...now(), title: '确定学习目标与资源', description: '学什么、用什么书/课', status: 'doing' },
      { ...now(), title: '制定每日/每周计划', description: '每天学多少、何时复习', status: 'todo' },
      { ...now(), title: '执行并做笔记', description: '按计划学、记重点', status: 'todo' },
      { ...now(), title: '小项目或练习巩固', description: '用一个小项目/习题巩固', status: 'todo' },
    ];
    return steps;
  }

  // 通用：3–5 步
  const steps: TaskStep[] = [
    { ...now(), title: '明确目标与范围', description: '把目标写清楚、定好范围', status: 'doing' },
    { ...now(), title: '拆解第一步并执行', description: '先做最小可执行的一步', status: 'todo' },
    { ...now(), title: '按顺序推进', description: '完成一步再下一步', status: 'todo' },
    { ...now(), title: '复盘与收尾', description: '检查是否达成、收尾', status: 'todo' },
  ];
  return steps;
}

/** 调整型：在现有任务基础上简化（减少步骤、合并） */
function buildAdjustedTask(activeTask: TaskPlan): TaskPlan {
  const steps = activeTask.steps;
  if (steps.length <= 2) return activeTask;
  const reduced = steps.slice(0, Math.max(2, Math.ceil(steps.length / 2)));
  const firstDoing = reduced.findIndex((s) => s.status === 'doing');
  const doingIndex = firstDoing >= 0 ? firstDoing : 0;
  const newSteps = reduced.map((s, i) => ({
    ...s,
    id: s.id,
    status: (i === doingIndex ? 'doing' : i < doingIndex ? 'done' : 'todo') as TaskStep['status'],
  }));
  return {
    ...activeTask,
    steps: newSteps,
    status: 'active',
  };
}

/**
 * 根据用户最后一条消息与当前任务/步骤，生成模拟回复与可选任务操作
 */
export function getMockResponse(
  lastUserContent: string,
  activeTask: TaskPlan | null,
  currentStep: TaskStep | null
): MockResponse {
  const lower = lastUserContent.trim().toLowerCase();
  const taskId = generateId();
  const now = Date.now();

  // 推进型：下一步 / 这个步骤完成了
  if (isAdvanceIntent(lower)) {
    if (!activeTask) {
      return {
        blocks: [
          textBlock('当前没有进行中的任务。你可以说一个目标，比如「帮我规划一次日本旅行」，我来帮你拆成步骤、一步步推进。'),
        ],
      };
    }
    if (!currentStep) {
      const firstTodo = activeTask.steps.find((s) => s.status === 'todo');
      return {
        blocks: [
          textBlock(firstTodo
            ? `下一步：${firstTodo.title}。你可以直接开始做，做完后说「完成了」或「下一步」。`
            : '该任务已没有待办步骤。可以说「全部完成」或新建一个目标。'),
        ],
      };
    }
    const idx = activeTask.steps.findIndex((s) => s.id === currentStep.id);
    const nextStep = idx >= 0 ? activeTask.steps[idx + 1] : undefined;
    if (!nextStep) {
      return {
        blocks: [
          textBlock('🎉 太棒了，这个任务已经全部完成！如果你有新的目标，我们可以继续。'),
        ],
        advanceStep: true,
      };
    }
    return {
      blocks: [
        textBlock(`已标记完成。下一步：${nextStep.title}`),
        { type: 'extra', title: '下一步', value: nextStep.title },
      ],
      advanceStep: true,
    };
  }

  // 调整型：计划太紧 / 简单一点
  if (isAdjustIntent(lower) && activeTask) {
    const adjusted = buildAdjustedTask(activeTask);
    const doingStep = adjusted.steps.find((s) => s.status === 'doing');
    return {
      blocks: [
        textBlock(`已按你的要求简化计划，现在共 ${adjusted.steps.length} 步。${doingStep ? `当前步骤：${doingStep.title}` : ''}`),
        doingStep ? { type: 'extra', title: '当前步骤', value: doingStep.title } : undefined,
      ].filter(Boolean) as MessageBlock[],
      task: adjusted,
    };
  }

  // 目标型：创建任务
  if (isGoalIntent(lower)) {
    const title =
      lower.includes('旅行') || lower.includes('日本') ? '旅行规划' :
      lower.includes('健身') || lower.includes('减肥') ? '健身计划' :
      lower.includes('面试') ? '面试准备' :
      lower.includes('报告') ? '写报告' :
      lower.includes('学习') || lower.includes('学一门') ? '学习计划' :
      '新任务';
    const steps = buildStepsForGoal(lastUserContent, title);
    const task: TaskPlan = {
      id: taskId,
      title,
      goal: lastUserContent,
      steps,
      status: 'active',
      createdAt: now,
    };
    const firstStep = steps[0];
    return {
      blocks: [
        textBlock(`好的，已为你生成「${title}」任务，拆成 ${steps.length} 步。`),
        { type: 'extra', title: '下一步', value: firstStep.title },
      ],
      task,
    };
  }

  // 问答 / 其他：助手人格 — 克制、清晰、指向下一步
  if (activeTask && currentStep) {
    return {
      blocks: [
        textBlock(`当前任务「${activeTask.title}」进行中，当前步骤：${currentStep.title}。做完可以说「完成了」或「下一步」。`),
        { type: 'extra', title: '当前步骤', value: currentStep.title },
      ],
    };
  }
  if (activeTask) {
    const next = activeTask.steps.find((s) => s.status === 'doing' || s.status === 'todo');
    return {
      blocks: [
        textBlock(next
          ? `你有一个进行中的任务「${activeTask.title}」。下一步：${next.title}。`
          : '当前任务已无待办。可以说一个新目标，或说「全部完成」结束当前任务。'),
      ],
    };
  }
  return {
    blocks: [
      textBlock('我是 MoreAI，专注把想法变成计划、陪你执行。可以说一个目标，例如「帮我规划一次日本旅行」或「准备面试」。'),
    ],
  };
}
