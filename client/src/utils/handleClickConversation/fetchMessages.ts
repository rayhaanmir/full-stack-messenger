import type { MessageProps } from "../../components/Home/MessageWindow/Message/Message";

export interface fetchMessagesProps {
  host: string;
  port: number;
  conversationId: string;
  navigateLogin: () => void;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  before?: number;
  limit?: number;
}

export const fetchMessages = async ({
  host,
  port,
  conversationId,
  navigateLogin,
  accessToken,
  setAccessToken,
  before = 0,
  limit = 0,
}: fetchMessagesProps): Promise<MessageProps[]> => {
  const params = new URLSearchParams({
    conversationId,
    limit: limit.toString(),
  });

  if (before) {
    params.append("before", before.toString());
  }

  let res = await fetch(
    `http://${host}:${port}/api/messages?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (res.status === 401 || res.status === 403) {
    const refreshRes = await fetch(`http://${host}:${port}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const token = await refreshRes.json();
      localStorage.setItem("accessToken", token.accessToken);
      setAccessToken(token.accessToken);
      res = await fetch(
        `http://${host}:${port}/api/messages?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } else {
      localStorage.removeItem("accessToken");
      navigateLogin();
    }
  }

  if (!res.ok) {
    alert("Failed to fetch messages");
  }

  const messages: MessageProps[] = await res.json();
  return messages;
};
