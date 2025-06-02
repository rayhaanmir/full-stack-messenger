import type { MessageProps } from "./Message/Message";
import Message from "./Message/Message";
import "./MessageWindow.css";

interface MessageWindowProps {
  messageArray: MessageProps[];
}

const MessageWindow = ({ messageArray }: MessageWindowProps) => {
  return (
    <div className="main-wrapper">
      {messageArray
        .slice()
        .reverse()
        .map((msg) => (
          <Message key={msg._id} {...msg} />
        ))}
    </div>
  );
};

export default MessageWindow;
