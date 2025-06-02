import "./Message.css";

export interface MessageProps {
  _id: string;
  sender: string;
  mentions: string[];
  text: string;
  timestamp: number;
  conversationId: string;
}

const Message = ({
  _id,
  sender,
  mentions,
  text,
  timestamp,
  conversationId,
}: MessageProps) => {
  return (
    <div className="text-wrapper">
      <strong>{sender}:</strong>
      {text}
    </div>
  );
};

export default Message;
