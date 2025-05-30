import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Socket } from "socket.io-client";
import Dropdown from "../../components/Dropdown/Dropdown.tsx";
import type { DropdownItemProps } from "../../components/Dropdown/Item/DropdownItem.tsx";
import CreateConversationForm from "../../components/CreateConversationForm/CreateConversationForm.tsx";
import "./Home.css";

interface HomeProps {
  userId: string;
  socket: Socket | null;
}

const Home = ({ userId, socket }: HomeProps) => {
  const [message, setMessage] = useState<string>("");
  const [showCreateConversation, setShowCreateConversation] =
    useState<boolean>(false);
  const [members, setMembers] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const navigate = useNavigate();
  const items: DropdownItemProps[] = [
    {
      label: "Create conversation",
      action: () => setShowCreateConversation(true),
    },
  ];

  const navigateLogin = () => {
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const chatId = userId + "_" + name;
  //   socket?.emit(
  //     "send-message",
  //     userId,
  //     [name],
  //     message,
  //     chatId,
  //     (successful: boolean) => {
  //       if (successful) {
  //         console.log(`Message sent to ${name}`);
  //       } else {
  //         alert("Message failed to send");
  //         setName("");
  //       }
  //       setMessage("");
  //     }
  //   );
  // };

  const handleSubmitConversation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const membersNoWhitespace: string = members.replace(/\s/g, "");
    const memberArray: string[] = membersNoWhitespace.split(",");
    let isDM: boolean = false;
    if (memberArray.length === 0) {
      alert("Member list cannot be empty");
      return;
    }
    if (memberArray.length === 1) {
      isDM = true;
      if (!groupName) {
        setGroupName(memberArray[0]);
      }
    } else {
      if (!groupName) {
        alert("Group name cannout be empty");
        return;
      }
    }
    socket?.emit(
      "create-conversation",
      groupName,
      isDM,
      memberArray,
      (successful: boolean) => {
        if (successful) {
          console.log(`Conversation created`);
        } else {
          alert("Failed to create conversation");
        }
        setMembers("");
        setGroupName("");
      }
    );
  };

  return (
    <>
      <div
        className="top-wrapper"
        style={
          showCreateConversation
            ? { filter: "blur(0.1rem)", pointerEvents: "none" }
            : {}
        }
      >
        <Dropdown
          buttonText="Select a conversation"
          content={{ items }}
          showCreateConversation={showCreateConversation}
        />
      </div>
      <div
        className="middle-wrapper"
        style={
          showCreateConversation
            ? { filter: "blur(0.1rem)", pointerEvents: "none" }
            : {}
        }
      >
        <div tabIndex={-1}>
          <h1>Welcome, {userId}!</h1>
          <form className="message-form" /*onSubmit={handleSubmitMessage}*/>
            <textarea
              className="message-body"
              value={message}
              onChange={handleChange}
              placeholder="Type message here"
              tabIndex={showCreateConversation ? -1 : 0}
            />
            <button
              className="message-button"
              type="submit"
              tabIndex={showCreateConversation ? -1 : 0}
            >
              Send message
            </button>
          </form>
        </div>
      </div>
      <CreateConversationForm
        showCreateConversation={showCreateConversation}
        onClose={() => setShowCreateConversation(false)}
        onCreate={handleSubmitConversation}
        members={members}
        setMembers={setMembers}
        groupName={groupName}
        setGroupName={setGroupName}
      />
      <div className="bottom-wrapper">
        <p>
          Not you?{" "}
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
        </p>
      </div>
    </>
  );
};

export default Home;
