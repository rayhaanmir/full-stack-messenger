import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { SidebarEntryProps } from "../..//components/Sidebar/SidebarEntry/SidebarEntry.tsx";
import type { MessageProps } from "../../components/MessageWindow/Message/Message.tsx";
import CreateConversationForm from "../../components/CreateConversationForm/CreateConversationForm.tsx";
import Sidebar from "../../components/Sidebar/Sidebar.tsx";
import { FaArrowRight } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import MessageWindow from "../../components/MessageWindow/MessageWindow.tsx";
import { playSound } from "react-sounds";
import notifySound from "../../assets/sounds/notification-pluck-off-269290.mp3";
import "./Home.css";

interface HomeProps {
  userId: string;
  socket: Socket | null;
}

const Home = ({ userId, socket }: HomeProps) => {
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

  useEffect(() => {
    socket?.emit("join-user-room", userId);
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

    socket?.on("receive-message", handleReceiveMessage);
    socket?.on("receive-conversation", handleReceiveConversation);
    socket?.on("receive-conversation-update", handleReceiveConversationUpdate);

    return () => {
      socket?.off("receive-message", handleReceiveMessage);
      socket?.off("receive-conversation", handleReceiveConversation);
      socket?.off(
        "receive-conversation-update",
        handleReceiveConversationUpdate
      );
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
    socket?.emit("leave-user-room", userId);
    navigate("/login");
  };

  const handleClickConversation = async (entry: SidebarEntryProps) => {
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
          const newMap = new Map(old);
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
    const memberArray = members.split(",");
    memberArray.push(userId);
    let isDM = false;
    let modifiedGroupName = groupName;
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
          userId={userId}
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
            tabIndex={showCreateConversation ? -1 : 0}
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
