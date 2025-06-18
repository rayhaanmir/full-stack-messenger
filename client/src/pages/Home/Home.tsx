import type { Socket } from "socket.io-client";
import type { SidebarEntryProps } from "../../components/Home/Sidebar/SidebarEntry/SidebarEntry.tsx";
import type { MessageProps } from "../../components/Home/MessageWindow/Message/Message.tsx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import CreateConversationForm from "../../components/Home/CreateConversationForm/CreateConversationForm.tsx";
import Sidebar from "../../components/Home/Sidebar/Sidebar.tsx";
import MessageWindow from "../../components/Home/MessageWindow/MessageWindow.tsx";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "../../components/Home/Modal/Modal.tsx";
import { FaArrowRight } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { useSocketHandlers } from "../../hooks/useSocketHandlers.ts";
import { fetchConversations } from "../../utils/fetchConversations.ts";
import { handleSubmitConversation } from "../../utils/handleSubmitConversation/handleSubmitConversation.ts";
import { handleClickConversation } from "../../utils/handleClickConversation/handleClickConversation.ts";
import "./Home.css";

interface HomeProps {
  username: string;
  userId: string;
  socket: Socket;
  isMobile: boolean;
  connected: boolean;
}

const host = import.meta.env.VITE_SERVER_IP;
const port = import.meta.env.VITE_SERVER_PORT;

const Home = ({ username, userId, socket, isMobile, connected }: HomeProps) => {
  const navigate = useNavigate();
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [members, setMembers] = useState(""); // Comma separated list of members
  const [groupName, setGroupName] = useState("");
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
    new Map<string, string>()
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") ?? ""
  );
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningModalText, setWarningModalText] = useState("");

  const allMessagesRef = useRef(allMessages);
  const itemsRef = useRef(items);
  const conversationLoadedRef = useRef(conversationLoaded);
  useEffect(() => {
    socket.emit("join-user-room");
    fetchConversations({
      host,
      port,
      navigateLogin,
      accessToken,
      setAccessToken,
      setAllMessageBodies,
      setItems,
    });
  }, []);

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
    username,
    allMessagesRef,
    conversationLoadedRef,
    setAllMessages,
    setItems,
  });

  const navigateLogin = () => {
    socket.disconnect();
    fetch(`http://${host}:${port}/api/logout`, {
      method: "DELETE",
      credentials: "include",
    });
    localStorage.clear();
    setAccessToken("");
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAllMessageBodies((old) => {
      const updated = new Map(old);
      updated.set(conversationLoaded?._id ?? "", e.target.value);
      return updated;
    });
  };

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit(
      "send-message",
      username,
      [], // TODO Implement mentioning specific users
      allMessageBodies.get(conversationLoaded?._id ?? ""),
      conversationLoaded?._id,
      (successful: boolean) => {
        if (!successful) {
          setWarningModalText("Message failed to send");
          setWarningModalOpen(true);
        }
        setAllMessageBodies((old) => {
          const newMap = new Map(old);
          newMap.set(conversationLoaded?._id ?? "", "");
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

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitConversation({
      members,
      groupName,
      setMembers,
      setGroupName,
      socket,
      userId,
      setWarningModalText,
      setWarningModalOpen,
    });
  };

  const onClickConversation = async (entry: SidebarEntryProps) => {
    const fetchMessagesItems = {
      host,
      port,
      conversationId: entry._id,
      navigateLogin,
      accessToken,
      setAccessToken,
      setWarningModalText,
      setWarningModalOpen,
    };
    handleClickConversation({
      socket,
      entry,
      conversationLoaded,
      allMessages,
      items,
      setConversationLoaded,
      setAllMessages,
      setItems,
      fetchMessagesItems,
    });
  };

  const sidebarProps = {
    SidebarEntries: items,
    fullWidth,
    setAnimateSidebarWidth,
    setFullWidth,
    setShowCreateConversation,
    setRenderCreate,
    username,
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
    style: { width: string };
    onTransitionEnd: (e: React.TransitionEvent<HTMLDivElement>) => void;
  } = {
    className: `middle-wrapper${
      !isMobile && animateSidebarWidth ? " animate" : ""
    }`,
    style: {
      width: isMobile || fullWidth ? "100vw" : "calc(100vw - 16rem)",
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

  const logoutIconWrapperProps = {
    className: "logout-icon-wrapper",
    tabIndex: -1,
  };

  const logoutIconProps = {
    className: "logout-icon",
    tabIndex: showCreateConversation ? -1 : 0,
    onClick: navigateLogin,
    onKeyDown: (e: React.KeyboardEvent<SVGElement>) =>
      e.key === "Enter" && navigateLogin(),
    title: "Log out",
  };

  const messageWindowProps = {
    allMessages,
    idLoaded: conversationLoaded?._id,
  };

  const textareaAutosizeProps = {
    className: "message-body",
    value: allMessageBodies.get(conversationLoaded?._id ?? ""),
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    placeholder: `Message ${
      conversationLoaded?.isDM
        ? conversationLoaded?.members[0]
        : `"${conversationLoaded?.conversationName}"`
    }`,
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const messageButtonProps: {
    className: string;
    type: "submit";
    tabIndex: number;
    disabled: boolean;
  } = {
    className: "message-button",
    type: "submit",
    tabIndex: showCreateConversation ? -1 : 0,
    disabled: !allMessageBodies.get(conversationLoaded?._id ?? ""),
  };

  const createConversationFormProps = {
    onClose: () => setShowCreateConversation(false),
    onCreate,
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
          <div {...logoutIconWrapperProps}>
            <IoIosLogOut {...logoutIconProps} />
          </div>
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
            <h1>Welcome, {username}!</h1>
            <p>Select a conversation and get to chatting!</p>
          </div>
        )}
      </div>
      {renderCreate && (
        <CreateConversationForm {...createConversationFormProps} />
      )}
      {warningModalOpen && (
        <Modal
          modalText={warningModalText}
          setIsOpen={setWarningModalOpen}
          color="#C80000"
          fontSize="1rem"
          blockPointer={true}
          center={true}
          dimScreen={true}
        />
      )}
      {!connected && (
        <Modal
          modalText="Lost connection. Refresh the page if issue persists."
          color="#C80000"
          fontSize="1.5rem"
          blockPointer={false}
          center={false}
          dimScreen={false}
        />
      )}
    </>
  );
};

export default Home;
