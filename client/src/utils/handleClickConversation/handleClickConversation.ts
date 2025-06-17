import type { SidebarEntryProps } from "../../components/Home/Sidebar/SidebarEntry/SidebarEntry";
import type { MessageProps } from "../../components/Home/MessageWindow/Message/Message";
import type { fetchMessagesProps } from "./fetchMessages";
import { fetchMessages } from "./fetchMessages";
import type { Socket } from "socket.io-client";

interface onClickConversationProps {
  socket: Socket;
  entry: SidebarEntryProps;
  conversationLoaded: SidebarEntryProps | null;
  allMessages: Map<
    string,
    {
      messages: MessageProps[];
      animationState: boolean;
    }
  >;
  items: SidebarEntryProps[];
  setConversationLoaded: React.Dispatch<
    React.SetStateAction<SidebarEntryProps | null>
  >;
  setAllMessages: React.Dispatch<
    React.SetStateAction<
      Map<
        string,
        {
          messages: MessageProps[];
          animationState: boolean;
        }
      >
    >
  >;
  setItems: React.Dispatch<React.SetStateAction<SidebarEntryProps[]>>;
  fetchMessagesItems: fetchMessagesProps;
}

export const handleClickConversation = async ({
  socket,
  entry,
  conversationLoaded,
  allMessages,
  items,
  setConversationLoaded,
  setAllMessages,
  setItems,
  fetchMessagesItems,
}: onClickConversationProps) => {
  if (entry._id !== conversationLoaded?._id) {
    setConversationLoaded?.(entry);
    const currentItems = items;
    const index = currentItems.findIndex(
      (conversation) => conversation._id === entry._id
    );
    currentItems[index].updateAlert = false;
    setItems(currentItems);
    if (!allMessages.has(entry._id)) {
      // TODO Limit loaded messages and implement dynamically loading older messages
      socket.emit("join-conversation", entry._id);
      const currentMessages: MessageProps[] = await fetchMessages(
        fetchMessagesItems
      );
      setAllMessages((old) => {
        const updated = new Map(old);
        updated.set(entry._id, {
          messages: currentMessages,
          animationState: false,
        });
        return updated;
      });
    }
  }
};
