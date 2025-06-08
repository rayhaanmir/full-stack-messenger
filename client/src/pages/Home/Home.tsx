import type { Socket } from "socket.io-client";
import type { SidebarEntryProps } from "../../components/Home/Sidebar/SidebarEntry/SidebarEntry.tsx";
import type { MessageProps } from "../../components/Home/MessageWindow/Message/Message.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import CreateConversationForm from "../../components/Home/CreateConversationForm/CreateConversationForm.tsx";
import Sidebar from "../../components/Home/Sidebar/Sidebar.tsx";
import { FaArrowRight } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import MessageWindow from "../../components/Home/MessageWindow/MessageWindow.tsx";
import TextareaAutosize from "react-textarea-autosize";
import { useSocketHandlers } from "../../hooks/useSocketHandlers.ts";
import { validateUsernames } from "../../utils/validateUsernames.ts";
import { fetchMessages } from "../../utils/fetchMessages.ts";
import "./Home.css";

interface HomeProps {
  userId: string;
  socket: Socket | null;
  isMobile: boolean;
}

const Home = ({ userId, socket, isMobile }: HomeProps) => {
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [members, setMembers] = useState("");
  const [groupName, setGroupName] = useState("");
  const navigate = useNavigate();
  const [items, setItems] = useState<SidebarEntryProps[]>([]);
  const [fullWidth, setFullWidth] = useState(true);
  const [animateSidebarWidth, setAnimateSidebarWidth] = useState(false);
  const [renderSidebar, setRenderSidebar] = useState(false);
  const [renderCreate, setRenderCreate] = useState(false);
  const [conversationLoaded, setConversationLoaded] =
    useState<SidebarEntryProps | null>(null);
  const [allMessages, setAllMessages] = useState(
    new Map<string, { messages: MessageProps[]; animationState: boolean }>()
  );
  const [allMessageBodies, setAllMessageBodies] = useState(
    new Map<string | undefined, string>()
  );

  const allMessagesRef = useRef(allMessages);
  const itemsRef = useRef(items);
  const conversationLoadedRef = useRef(conversationLoaded);
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    conversationLoadedRef.current = conversationLoaded;
  }, [conversationLoaded]);

  useSocketHandlers({
    socket,
    userId,
    allMessagesRef,
    conversationLoadedRef,
    setAllMessages,
    setItems,
  });

  const fetchConversations = async () => {
    const res = await fetch(
      `http://192.168.1.30:3000/api/conversations/${userId}`
    );
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

  const navigateLogin = () => {
    socket?.emit("leave-user-room", userId);
    navigate("/login");
  };

  const onClickConversation = async (entry: SidebarEntryProps) => {
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
        socket?.emit("join-conversation", entry._id);
        const currentMessages: MessageProps[] = await fetchMessages(entry._id);
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAllMessageBodies((old) => {
      const updated = new Map(old);
      updated.set(conversationLoaded?._id, e.target.value);
      return updated;
    });
  };

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit(
      "send-message",
      userId,
      [], // TODO Implement mentioning specific users
      allMessageBodies.get(conversationLoaded?._id),
      conversationLoaded?._id,
      (successful: boolean) => {
        if (!successful) {
          alert("Message failed to send");
        }
        setAllMessageBodies((old) => {
          const newMap = new Map(old);
          newMap.set(conversationLoaded?._id, "");
          return newMap;
        });
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      (e.target as HTMLTextAreaElement).form?.requestSubmit(); // Submit the form
    }
  };

  const handleSubmitConversation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const memberArray = members.split(",");
    memberArray.push(userId);
    let isDM = false;
    let modifiedGroupName = groupName;
    if (memberArray.length === 1) {
      alert("Member list cannot be empty");
      return;
    }
    const valid = await validateUsernames(socket, memberArray.slice(0, -1)); // skip current user
    if (!valid) return;
    if (memberArray.length === 2) {
      if (!groupName) {
        isDM = true;
        modifiedGroupName = userId + "_" + memberArray[0];
      }
    } else {
      if (!groupName) {
        alert("Group name cannot be empty");
        return;
      }
    }
    socket?.emit(
      "create-conversation",
      modifiedGroupName,
      isDM,
      memberArray,
      (successful: boolean) => {
        if (!successful) {
          alert("Failed to create conversation");
        }
        setMembers("");
        setGroupName("");
      }
    );
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (!isMobile) {
      if (e.propertyName === "width") {
        setAnimateSidebarWidth(false);
        if (fullWidth) {
          setRenderSidebar(false);
        }
      }
    }
  };

  const sidebarProps = {
    SidebarEntries: items,
    fullWidth,
    setAnimateSidebarWidth,
    setFullWidth,
    setShowCreateConversation,
    setRenderCreate,
    userId,
    showCreateConversation,
    idLoaded: conversationLoaded?._id,
    setConversationLoaded,
    onClickConversation,
    isMobile,
    setRenderSidebar,
    animateSidebarWidth,
  };

  const middleWrapperProps: {
    className: string;
    style: { width: string; pointerEvents: "none" | "auto"; filter: string };
    onTransitionEnd: (e: React.TransitionEvent<HTMLDivElement>) => void;
  } = {
    className: `middle-wrapper${
      !isMobile && animateSidebarWidth ? " animate" : ""
    }`,
    style: {
      width: isMobile || fullWidth ? "100vw" : "calc(100vw - 16rem)",
      pointerEvents: showCreateConversation ? "none" : "auto",
      filter: showCreateConversation ? "blur(0.1rem)" : "none",
    },
    onTransitionEnd: handleTransitionEnd,
  };

  const openButtonProps = {
    className: "open-button",
    tabIndex: showCreateConversation ? -1 : 0,
    onClick: () => {
      setRenderSidebar(true);
      setAnimateSidebarWidth(true);
      requestAnimationFrame(() => setFullWidth(false));
    },
    title: "Open the sidebar",
  };

  const messageWindowProps = {
    allMessages,
    idLoaded: conversationLoaded?._id,
  };

  const textareaAutosizeProps = {
    className: "message-body",
    value: allMessageBodies.get(conversationLoaded?._id),
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    placeholder: `Message ${
      conversationLoaded?.isDM
        ? conversationLoaded?.members[0]
        : `"${conversationLoaded?.chatId}"`
    }`,
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const messageButtonProps: {
    className: string;
    type: "submit";
    tabIndex: number;
  } = {
    className: "message-button",
    type: "submit",
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const spanProps = {
    onClick: navigateLogin,
    onKeyDown: (e: React.KeyboardEvent<HTMLSpanElement>) =>
      e.key === "Enter" && navigateLogin(),
    style: { color: "#ADC2FC", cursor: "pointer", display: "inline" },
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const createConversationFormProps = {
    onClose: () => setShowCreateConversation(false),
    onCreate: handleSubmitConversation,
    members,
    setMembers,
    groupName,
    setGroupName,
    setRenderCreate,
    showCreateConversation,
  };

  return (
    <>
      {renderSidebar && <Sidebar {...sidebarProps} />}
      <div {...middleWrapperProps}>
        <div className="top-bar">
          {fullWidth && (
            <button {...openButtonProps}>
              <FaArrowRight />
            </button>
          )}
        </div>

        {conversationLoaded ? (
          <>
            <MessageWindow {...messageWindowProps} />
            <form className="message-form" onSubmit={handleSubmitMessage}>
              <TextareaAutosize {...textareaAutosizeProps} />
              <button {...messageButtonProps}>
                Send
                <IoIosSend />
              </button>
            </form>
          </>
        ) : (
          <div className="greeting-wrapper">
            <h1>Welcome, {userId}!</h1>
            <p>Select a conversation and get to chatting!</p>
          </div>
        )}
        <div className="bottom-wrapper">
          {"Not you? "}
          <span {...spanProps}>Log in here.</span>
        </div>
      </div>
      {renderCreate && (
        <CreateConversationForm {...createConversationFormProps} />
      )}
    </>
  );
};

export default Home;
