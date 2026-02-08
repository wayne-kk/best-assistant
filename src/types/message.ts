export type MessageBlock =
  | { type: 'text'; value: string }
  | { type: 'list'; items: string[] }
  | { type: 'extra'; title: string; value: string }
  | { type: 'image'; uri: string }
  | { type: 'audio'; uri: string };

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  blocks: MessageBlock[];
  createdAt: number;
};
