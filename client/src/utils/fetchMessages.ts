import type { MessageProps } from "../components/Home/MessageWindow/Message/Message";

export const fetchMessages = async (
  conversationId: string,
  before: number = 0,
  limit: number = 0
): Promise<MessageProps[]> => {
  const params = new URLSearchParams({
    conversationId,
    limit: limit.toString(),
  });

  if (before) {
    params.append("before", before.toString());
  }

  const res = await fetch(
    `http://192.168.1.30:3000/api/messages?${params.toString()}`
  );

  if (!res.ok) {
    alert("Failed to fetch messages");
  }

  const messages: MessageProps[] = await res.json();
  return messages;
};
