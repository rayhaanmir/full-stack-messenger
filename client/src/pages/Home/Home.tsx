import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { SidebarEntryProps } from "../..//components/Sidebar/SidebarEntry/SidebarEntry.tsx";
import type { MessageProps } from "../../components/MessageWindow/Message/Message.tsx";
import CreateConversationForm from "../../components/CreateConversationForm/CreateConversationForm.tsx";
import Sidebar from "../../components/Sidebar/Sidebar.tsx";
import { FaArrowRight } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import "./Home.css";
import MessageWindow from "../../components/MessageWindow/MessageWindow.tsx";

interface HomeProps {
  userId: string;
  socket: Socket | null;
}

const Home = ({ userId, socket }: HomeProps) => {
  const [text, setText] = useState<string>("");
  const [showCreateConversation, setShowCreateConversation] =
    useState<boolean>(false);
  const [members, setMembers] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const navigate = useNavigate();
  const [items, setItems] = useState<SidebarEntryProps[]>([]);
  const [fullWidth, setFullWidth] = useState<boolean>(true);
  const [animateSidebarWidth, setAnimateSidebarWidth] =
    useState<boolean>(false);
  const [renderSidebar, setRenderSidebar] = useState<boolean>(false);
  const [renderCreate, setRenderCreate] = useState<boolean>(false);
  const [conversationLoaded, setConversationLoaded] =
    useState<SidebarEntryProps | null>(null);
  const [allMessages, setAllMessages] = useState<
    Map<string, MessageProps[] | undefined>
  >(new Map<string, MessageProps[]>());
  const [startMessageAnimation, setStartMessageAnimation] = useState<
    [boolean, string]
  >([false, ""]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, items]);

  useEffect(() => {
    const handleMessage = (msg: MessageProps) => {
      const newConversationMessages: MessageProps[] | undefined =
        allMessages.get(msg.conversationId);
      if (newConversationMessages) {
        console.log("two");
        setStartMessageAnimation([true, msg._id]);
        newConversationMessages?.unshift(msg);
        setAllMessages((old) =>
          old.set(msg.conversationId, newConversationMessages)
        );
        setTimeout(() => setStartMessageAnimation([false, msg._id]), 50);
      }
    };

    socket?.on("receive-message", handleMessage);
    return () => {
      socket?.off("receive-message", handleMessage);
    };
  }, [socket]);

  const fetchConversations = async () => {
    const res = await fetch(
      `http://192.168.1.30:3000/api/conversations/${userId}`
    );
    const data: SidebarEntryProps[] = await res.json();
    setItems(data);
  };

  const navigateLogin = () => {
    navigate("/login");
  };

  const handleClickConversation = async (entry: SidebarEntryProps) => {
    setConversationLoaded?.(entry);
    if (!allMessages.has(entry._id)) {
      // TODO Limit loaded messages and implement dynamically loading older messages
      socket?.emit("join-conversation", entry._id);
      const currentMessages = await fetchMessages(entry._id);
      setAllMessages((old) => old.set(entry._id, currentMessages));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit(
      "send-message",
      userId,
      [], // TODO Implement mentioning specific users
      text,
      conversationLoaded?._id,
      (successful: boolean) => {
        if (!successful) {
          alert("Message failed to send");
        }
        setText("");
      }
    );
  };

  const validateUsernames = async (
    usernameArray: string[]
  ): Promise<boolean> => {
    const checks = usernameArray.map((name) => {
      return new Promise<boolean>((resolve) => {
        socket?.emit("validate-username", name, (exists: boolean) => {
          resolve(exists);
        });
      });
    });
    const results = await Promise.all(checks);
    for (let i = 0; i < usernameArray.length; i++) {
      if (!results[i]) {
        alert(`The user "${usernameArray[i]}" does not exist`);
        return false;
      }
    }
    return true;
  };

  const fetchMessages = async (
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

  const handleSubmitConversation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const memberArray: string[] = members.split(",");
    memberArray.push(userId);
    let isDM: boolean = false;
    let modifiedGroupName: string = groupName;
    if (memberArray.length === 1) {
      alert("Member list cannot be empty");
      return;
    }
    const valid = await validateUsernames(memberArray.slice(0, -1)); // skip current user
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

  return (
    <>
      {renderSidebar && (
        <Sidebar
          SidebarEntries={items}
          fullWidth={fullWidth}
          setAnimateSidebarWidth={setAnimateSidebarWidth}
          setFullWidth={setFullWidth}
          setShowCreateConversation={setShowCreateConversation}
          setRenderCreate={setRenderCreate}
          showCreateConversation={showCreateConversation}
          idLoaded={conversationLoaded?._id}
          setConversationLoaded={setConversationLoaded}
          onClickConversation={handleClickConversation}
        />
      )}
      <div
        className={`middle-wrapper${animateSidebarWidth ? " animate" : ""}`}
        style={
          showCreateConversation
            ? { filter: "blur(0.1rem)", pointerEvents: "none" }
            : fullWidth
            ? { width: "100vw" }
            : {}
        }
        onTransitionEnd={(e) => {
          if (e.propertyName === "width") {
            setAnimateSidebarWidth(false);
            if (fullWidth) {
              setRenderSidebar(false);
            }
          }
        }}
      >
        {fullWidth && (
          <div
            className="open-button-wrapper"
            tabIndex={showCreateConversation ? -1 : 0}
          >
            <button
              className="open-button"
              onClick={() => {
                setRenderSidebar(true);
                setAnimateSidebarWidth(true);
                setFullWidth(false);
              }}
              title="Open the sidebar"
            >
              <FaArrowRight />
            </button>
          </div>
        )}
        {conversationLoaded ? (
          <>
            <MessageWindow
              allMessages={allMessages}
              idLoaded={conversationLoaded?._id}
              startMessageAnimation={startMessageAnimation}
            />
            <form className="message-form" onSubmit={handleSubmitMessage}>
              <textarea
                className="message-body"
                value={text}
                onChange={handleChange}
                placeholder="Type message here"
                tabIndex={showCreateConversation ? -1 : 0}
              />
              <button
                className="message-button"
                type="submit"
                tabIndex={showCreateConversation ? -1 : 0}
              >
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
          <span
            onClick={navigateLogin}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigateLogin();
              }
            }}
            style={{ color: "#ADC2FC", cursor: "pointer", display: "inline" }}
            tabIndex={0}
          >
            Log in here.
          </span>
        </div>
      </div>
      {renderCreate && (
        <CreateConversationForm
          onClose={() => setShowCreateConversation(false)}
          onCreate={handleSubmitConversation}
          members={members}
          setMembers={setMembers}
          groupName={groupName}
          setGroupName={setGroupName}
          setRenderCreate={setRenderCreate}
          showCreateConversation={showCreateConversation}
        />
      )}
    </>
  );
};

export default Home;
