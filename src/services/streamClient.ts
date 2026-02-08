/**
 * SSE / 流式输出客户端
 * 用于接收 BFF 的流式回复，边收边更新 UI
 */

const getBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_BFF_URL ?? 'https://your-bff.example.com';
};

export type StreamCallbacks = {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
};

/**
 * 发起 SSE 流式请求，通过 onChunk 逐段推送内容
 */
export function streamChat(
  payload: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    currentTaskId?: string | null;
    currentStepId?: string | null;
    taskContext?: string | null;
  },
  callbacks: StreamCallbacks
): () => void {
  const url = `${getBaseUrl()}/api/chat/stream`;
  const controller = new AbortController();

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Stream error: ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) {
        callbacks.onDone();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data) as { text?: string };
              if (parsed.text) callbacks.onChunk(parsed.text);
            } catch {
              // 忽略非 JSON 行
            }
          }
        }
      }
      callbacks.onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') callbacks.onError(err);
    });

  return () => controller.abort();
}
