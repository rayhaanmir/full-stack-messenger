import type { MessageProps } from "./Message/Message";
import Message from "./Message/Message";
import "./MessageWindow.css";

interface MessageWindowProps {
  allMessages: Map<
    string,
    { messages: MessageProps[]; animationState: boolean } | undefined
  >;
  idLoaded: string;
}

const MessageWindow = ({ allMessages, idLoaded }: MessageWindowProps) => {
  const conversationMessages:
    | { messages: MessageProps[]; animationState: boolean }
    | undefined = allMessages.get(idLoaded);
  return (
    <div className="main-wrapper">
      <div className="empty-space" />
      {conversationMessages?.["messages"].map((msg, index: number) => (
        <Message
          key={msg._id}
          {...msg}
          startMessageAnimation={
            conversationMessages["animationState"] && index == 0
          }
        />
      ))}
    </div>
  );
};

export default MessageWindow;
