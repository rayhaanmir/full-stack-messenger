import type { MessageProps } from "./Message/Message";
import Message from "./Message/Message";
import "./MessageWindow.css";

interface MessageWindowProps {
  allMessages: Map<string, MessageProps[] | undefined>;
  idLoaded: string;
  startMessageAnimation: [boolean, string];
}

const MessageWindow = ({
  allMessages,
  idLoaded,
  startMessageAnimation,
}: MessageWindowProps) => {
  const conversationMessages: MessageProps[] | undefined =
    allMessages.get(idLoaded);
  return (
    <div className="main-wrapper">
      <div className="empty-space" />
      {conversationMessages?.map((msg) => (
        <Message
          key={msg._id}
          {...msg}
          startMessageAnimation={startMessageAnimation}
        />
      ))}
    </div>
  );
};

export default MessageWindow;
