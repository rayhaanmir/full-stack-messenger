import type { SidebarEntryProps } from "../components/Home/Sidebar/SidebarEntry/SidebarEntry";

interface fetchConversationsProps {
  host: string;
  port: number;
  navigateLogin: () => void;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  setAllMessageBodies: React.Dispatch<
    React.SetStateAction<Map<string, string>>
  >;
  setItems: React.Dispatch<React.SetStateAction<SidebarEntryProps[]>>;
}

export const fetchConversations = async ({
  host,
  port,
  navigateLogin,
  accessToken,
  setAccessToken,
  setAllMessageBodies,
  setItems,
}: fetchConversationsProps) => {
  let res = await fetch(`http://${host}:${port}/api/conversations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (res.status === 401) {
    const refreshRes = await fetch(`http://${host}:${port}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const token = await refreshRes.json();
      localStorage.setItem("accessToken", token.accessToken);
      setAccessToken(token.accessToken);
      res = await fetch(`http://${host}:${port}/api/conversations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      localStorage.removeItem("accessToken");
      navigateLogin();
      return;
    }
  }
  const data: SidebarEntryProps[] = await res.json();
  setAllMessageBodies((old) => {
    const updated = new Map(old);
    for (const conversation of data) {
      updated.set(conversation._id, "");
    }
    return updated;
  });
  setItems(data);
};
