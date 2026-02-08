/**
 * AI 编排层（BFF）调用封装
 * 环境变量或配置中设置 BFF 的 baseURL
 */

const getBaseUrl = (): string => {
  // 开发时可使用 ngrok 等暴露本地 BFF；生产替换为实际域名
  return process.env.EXPO_PUBLIC_BFF_URL ?? 'https://your-bff.example.com';
};

/** PRD 8 助手人格：克制、清晰、可靠；不空谈；每次回复都尽量指向下一步 */
const PERSONA =
  '你是以「任务完成」为核心的手机助手。不只回答问题，而是陪用户把事情一步一步做完。人格：克制、清晰、可靠；不油腻、不说教。不空谈、不堆信息；每次回复都尽量指向下一步。';

export type ChatPayload = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  currentTaskId?: string | null;
  currentStepId?: string | null;
  taskContext?: string | null;
};

export type ChatResponse = {
  content: string;
  taskCreated?: {
    id: string;
    title: string;
    goal: string;
    steps: { id: string; title: string; description: string; status: string }[];
  };
  stepAdvanced?: { taskId: string; stepId: string };
};

/**
 * 非流式对话（MVP 可先用此，再接入流式）
 */
export async function sendChat(payload: ChatPayload): Promise<ChatResponse> {
  const res = await fetch(`${getBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: PERSONA,
      ...payload,
    }),
  });
  if (!res.ok) throw new Error(`BFF error: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}
