import "./Message.css";

export interface MessageProps {
  _id: string;
  sender: string;
  mentions: string[];
  text: string;
  timestamp: number;
  conversationId: string;
  startMessageAnimation: [boolean, string];
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
      className={`text-wrapper${
        startMessageAnimation[0] && startMessageAnimation[1] === _id
          ? " start-animation"
          : ""
      }`}
    >
      <strong className="sender-info" title="Click for message info">
        {`${sender} ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}:
      </strong>
      {text}
    </div>
  );
};

export default Message;
