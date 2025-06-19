import type { MessageProps } from "../../components/Home/MessageWindow/Message/Message";

export interface fetchMessagesProps {
  protocol: string;
  host: string;
  port: string;
  conversationId: string;
  navigateLogin: () => void;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  setWarningModalText: React.Dispatch<React.SetStateAction<string>>;
  setWarningModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  before?: number;
  limit?: number;
}

export const fetchMessages = async ({
  protocol,
  host,
  port,
  conversationId,
  navigateLogin,
  accessToken,
  setAccessToken,
  setWarningModalText,
  setWarningModalOpen,
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
    `${protocol}://${host}:${port}/api/messages?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (res.status === 401 || res.status === 403) {
    const refreshRes = await fetch(
      `${protocol}://${host}:${port}/api/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (refreshRes.ok) {
      const token = await refreshRes.json();
      localStorage.setItem("accessToken", token.accessToken);
      setAccessToken(token.accessToken);
      res = await fetch(
        `${protocol}://${host}:${port}/api/messages?${params.toString()}`,
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
    setWarningModalText("Failed to fetch messages");
    setWarningModalOpen(true);
  }

  const messages: MessageProps[] = await res.json();
  return messages;
};
