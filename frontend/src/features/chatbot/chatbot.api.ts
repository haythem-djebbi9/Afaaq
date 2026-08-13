import { API_URL, ApiError } from '@/shared/api/client';

export type ChatRole = 'USER' | 'ASSISTANT';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export async function fetchChatHistory(token: string): Promise<ChatMessage[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/chatbot/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError(0, 'network', 'network');
  }
  if (!res.ok) throw new ApiError(res.status, 'generic', `HTTP ${res.status}`);
  const body = (await res.json()) as { items: ChatMessage[] };
  return body.items;
}

/** Streams the assistant's reply, invoking onDelta as each text chunk arrives. */
export async function streamChatReply(
  token: string,
  message: string,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/chatbot/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
      signal,
    });
  } catch {
    throw new ApiError(0, 'network', 'network');
  }

  if (!res.ok || !res.body) {
    throw new ApiError(res.status, 'generic', `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}
