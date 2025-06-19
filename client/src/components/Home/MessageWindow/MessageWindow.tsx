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

  const messages = conversationMessages?.["messages"].map((msg, index) => (
    <Message
      key={msg._id}
      {...msg}
      startMessageAnimation={
        index === 0 && conversationMessages["animationState"]
      }
    />
  ));

  return (
    <div className="main-wrapper" tabIndex={-1}>
      <div className="empty-space" />
      {messages}
    </div>
  );
};

export default MessageWindow;
