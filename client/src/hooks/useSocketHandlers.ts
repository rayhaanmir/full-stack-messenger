import { useEffect } from "react";
import { playSound } from "react-sounds";
import notifySound from "../assets/sounds/notification-pluck-off-269290.mp3";
import type { Socket } from "socket.io-client";
import type { SidebarEntryProps } from "../components/Home/Sidebar/SidebarEntry/SidebarEntry.tsx";
import type { MessageProps } from "../components/Home/MessageWindow/Message/Message.tsx";

interface UseSocketHandlersProps {
  socket: Socket;
  username: string;
  allMessagesRef: React.RefObject<
    Map<
      string,
      {
        messages: MessageProps[];
        animationState: boolean;
      }
    >
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
  conversationLoadedRef: React.RefObject<SidebarEntryProps | null>;
}

export const useSocketHandlers = ({
  socket,
  username,
  allMessagesRef,
  setAllMessages,
  setItems,
  conversationLoadedRef,
}: UseSocketHandlersProps) => {
  useEffect(() => {
    socket.emit("join-user-room", username);
    const handleReceiveMessage = (msg: MessageProps) => {
      const newConversationMessages = allMessagesRef.current.get(
        msg.conversationId
      );
      if (newConversationMessages) {
        const newMessages = [msg, ...newConversationMessages.messages];
        const updatedEntry = {
          messages: newMessages,
          animationState: true,
        };
        setAllMessages((old) => {
          const newMap = new Map(old);
          newMap.set(msg.conversationId, updatedEntry);
          return newMap;
        });
        setTimeout(
          () =>
            setAllMessages((old) => {
              const newMap = new Map(old);
              const existing = newMap.get(msg.conversationId);
              if (existing) {
                newMap.set(msg.conversationId, {
                  ...existing,
                  animationState: false,
                });
              }
              return newMap;
            }),
          10
        );
      }
    };

    const handleReceiveConversation = (conversation: SidebarEntryProps) => {
      setItems((old) => [conversation, ...old]);
    };

    const handleReceiveConversationUpdate = (
      conversationId: string,
      sender: string,
      message: string
    ) => {
      setItems((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (conversation) => conversation._id === conversationId
        );
        if (index !== -1) {
          const [removed] = updated.splice(index, 1);
          removed.lastUser = sender;
          removed.lastMessage = message;
          if (conversationId !== conversationLoadedRef.current?._id) {
            removed.updateAlert = true;
            playSound(notifySound);
          }
          updated.unshift(removed);
        }
        return updated;
      });
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("receive-conversation", handleReceiveConversation);
    socket.on("receive-conversation-update", handleReceiveConversationUpdate);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("receive-conversation", handleReceiveConversation);
      socket.off(
        "receive-conversation-update",
        handleReceiveConversationUpdate
      );
    };
  }, [socket]);
};
