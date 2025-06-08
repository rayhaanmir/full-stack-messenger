import type { MessageProps } from "./Message/Message";
import Message from "./Message/Message";
import "./MessageWindow.css";

interface MessageWindowProps {
  allMessages: Map<
    string,
    { messages: MessageProps[]; animationState: boolean } | undefined
  >;
  idLoaded: string | undefined;
}

const MessageWindow = ({ allMessages, idLoaded }: MessageWindowProps) => {
  let conversationMessages;
  if (idLoaded) {
    conversationMessages = allMessages.get(idLoaded);
  }
  return (
    <div className="main-wrapper">
      <div className="empty-space" />
      {conversationMessages?.["messages"].map((msg, index) => (
        <Message
          key={msg._id}
          {...msg}
          startMessageAnimation={
            index === 0 && conversationMessages["animationState"]
          }
        />
      ))}
    </div>
  );
};

export default MessageWindow;
