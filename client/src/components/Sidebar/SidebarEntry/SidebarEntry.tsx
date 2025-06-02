import type { Socket } from "socket.io-client";
import "./SidebarEntry.css";

export interface SidebarEntryProps {
  _id: string;
  chatId: string;
  isDM: boolean;
  members: string[];
  lastMessage: string;
  lastUpdated: number;
  showCreateConversation?: boolean;
  onClickConversation?: (entry: SidebarEntryProps) => void;
}

const SidebarEntry = (props: SidebarEntryProps) => {
  const {
    _id,
    chatId,
    isDM,
    members,
    lastMessage,
    lastUpdated,
    showCreateConversation,
    onClickConversation,
  } = props;
  return (
    <div
      className="entry"
      style={isDM ? {} : { fontStyle: "italic" }}
      onClick={() => onClickConversation?.(props)}
      tabIndex={showCreateConversation ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && onClickConversation?.(props)}
    >
      {isDM ? members[0] : chatId}
    </div>
  );
};

export default SidebarEntry;
