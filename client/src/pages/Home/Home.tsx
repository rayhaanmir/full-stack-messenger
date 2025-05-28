import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Socket } from "socket.io-client";
import Dropdown from "../../components/Dropdown/Dropdown";
import type { DropdownItemProps } from "../../components/Dropdown/Item/DropdownItem";
import "./Home.css";

interface HomeProps {
  userId: string;
  socket: Socket | null;
}

const Home = ({ userId, socket }: HomeProps) => {
  const [name, setName] = useState<string>("");
  const [groupChatName, setGroupChatName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const items: DropdownItemProps[] = [
    {
      label: "Create conversation",
      action: () =>
        window.open("https://www.youtube.com", "_blank", "noopener,noreferrer"),
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chatId = userId + "_" + name;
    socket?.emit(
      "send-message",
      userId,
      [name],
      message,
      chatId,
      (successful: boolean) => {
        if (successful) {
          console.log(`Message sent to ${name}`);
        } else {
          alert("Message failed to send");
          setName("");
        }
        setMessage("");
      }
    );
  };

  return (
    <>
      <div className="top-wrapper">
        <Dropdown buttonText="Select a conversation" content={{ items }} />
      </div>
      <div>
        <h1>Welcome, {userId}!</h1>
        <form className="message-form" onSubmit={handleSubmit}>
          <input
            className="basic-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User to message"
          />
          <input
            className="basic-input"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
            placeholder="Group Chat Name (Optional for DMs)"
            style={{ borderTopWidth: 0 }}
          />
          <textarea
            className="message-body"
            value={message}
            onChange={handleChange}
            placeholder="Type message here"
          />
          <button type="submit" className="message-button">
            Send message
          </button>
        </form>
      </div>
      <div className="bottom-wrapper">
        <p>
          Not you?{" "}
          <span
            onClick={navigateLogin}
            style={{ color: "#ADC2FC", cursor: "pointer", display: "inline" }}
          >
            Log in here.
          </span>
        </p>
      </div>
    </>
  );
};

export default Home;
