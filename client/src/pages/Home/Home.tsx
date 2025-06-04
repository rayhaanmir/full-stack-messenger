import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  const [allMessageBodies, setAllMessageBodies] = useState<
    Map<string | undefined, string>
  >(new Map<string | undefined, string>());
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
    Map<
      string,
      { messages: MessageProps[]; animationState: boolean } | undefined
    >
  >(new Map<string, { messages: MessageProps[]; animationState: boolean }>());

  const allMessagesRef =
    useRef<
      Map<
        string,
        { messages: MessageProps[]; animationState: boolean } | undefined
      >
    >(allMessages);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    allMessagesRef.current = allMessages; // Allow useEffect below to use up-to-date array
  }, [allMessages]);

  useEffect(() => {
    const handleMessage = (msg: MessageProps) => {
      const newConversationMessages:
        | { messages: MessageProps[]; animationState: boolean }
        | undefined = allMessagesRef.current.get(msg.conversationId);
      if (newConversationMessages) {
        newConversationMessages["messages"]?.unshift(msg);
        newConversationMessages["animationState"] = true;
        setAllMessages((old) => {
          const newMap: Map<
            string,
            { messages: MessageProps[]; animationState: boolean } | undefined
          > = new Map(old);
          newMap.set(msg.conversationId, newConversationMessages);
          return newMap;
        });
        setTimeout(
          () =>
            setAllMessages((old) => {
              const newMap: Map<
                string,
                | { messages: MessageProps[]; animationState: boolean }
                | undefined
              > = new Map(old);
              newConversationMessages["animationState"] = false;
              newMap.set(msg.conversationId, newConversationMessages);
              return newMap;
            }),
          10
        );
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
    navigate("/login");
  };

  const handleClickConversation = async (entry: SidebarEntryProps) => {
    setConversationLoaded?.(entry);
    if (!allMessages.has(entry._id)) {
      // TODO Limit loaded messages and implement dynamically loading older messages
      socket?.emit("join-conversation", entry._id);
      const currentMessages: MessageProps[] = await fetchMessages(entry._id);
      setAllMessages((old) => {
        const updated: Map<
          string,
          { messages: MessageProps[]; animationState: boolean } | undefined
        > = new Map(old);
        updated.set(entry._id, {
          messages: currentMessages,
          animationState: false,
        });
        return updated;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAllMessageBodies((old) => {
      const updated: Map<string | undefined, string> = new Map(old);
      updated.set(conversationLoaded?._id, e.target.value);
      return updated;
    });
    e.target.style.height = "inherit";
    e.target.style.height = e.target.scrollHeight + "px";
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
          const newMap: Map<string | undefined, string> = new Map(old);
          newMap.set(conversationLoaded?._id, "");
          return newMap;
        });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents newline
      (e.target as HTMLTextAreaElement).form?.requestSubmit(); // Submit the form
    }
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
        <div className="top-bar">
          {fullWidth && (
            <button
              className="open-button"
              tabIndex={showCreateConversation ? -1 : 0}
              onClick={() => {
                setRenderSidebar(true);
                setAnimateSidebarWidth(true);
                setFullWidth(false);
              }}
              title="Open the sidebar"
            >
              <FaArrowRight />
            </button>
          )}
        </div>

        {conversationLoaded ? (
          <>
            <MessageWindow
              allMessages={allMessages}
              idLoaded={conversationLoaded?._id}
            />
            <form className="message-form" onSubmit={handleSubmitMessage}>
              <textarea
                className="message-body"
                value={allMessageBodies.get(conversationLoaded?._id)}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${
                  conversationLoaded?.isDM
                    ? conversationLoaded?.members[0]
                    : `"${conversationLoaded?.chatId}"`
                }`}
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
            onKeyDown={(e) => e.key === "Enter" && navigateLogin()}
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
