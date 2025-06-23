import "./Message.css";

export interface MessageProps {
  _id: string;
  sender: string;
  mentions: string[];
  text: string;
  timestamp: number;
  conversationId: string;
  startMessageAnimation: boolean;
}

const Message = ({
  _id,
  sender,
  mentions,
  text,
  timestamp,
  conversationId,
  startMessageAnimation,
}: MessageProps) => {
  const date: Date = new Date(timestamp);
  return (
    <div
      className={`message-wrapper${
        startMessageAnimation ? " start-animation" : ""
      }`}
    >
      <strong className="sender-info">
        {`${sender} ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}:
      </strong>
      <pre className="message-content">{text}</pre>
    </div>
  );
};

export default Message;
