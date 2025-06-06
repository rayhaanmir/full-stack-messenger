import { FaCircle } from "react-icons/fa";
import "./SidebarEntry.css";

export interface SidebarEntryProps {
  _id: string;
  chatId: string;
  isDM: boolean;
  members: string[];
  lastUser: string;
  lastMessage: string;
  lastUpdated: number;
  userId?: string;
  showCreateConversation?: boolean;
  idLoaded?: string | undefined;
  updateAlert?: boolean;
  onClickConversation?: (entry: SidebarEntryProps) => void;
}

const SidebarEntry = (props: SidebarEntryProps) => {
  const {
    _id,
    chatId,
    isDM,
    members,
    lastUser,
    lastMessage,
    lastUpdated,
    userId,
    showCreateConversation,
    idLoaded,
    updateAlert,
    onClickConversation,
  } = props;
  return (
    <div
      className="entry"
      style={
        idLoaded === _id
          ? {
              fontStyle: isDM ? "auto" : "italic",
              backgroundColor: "#757575",
            }
          : { fontStyle: isDM ? "auto" : "italic" }
      }
      onClick={() => idLoaded !== _id && onClickConversation?.(props)}
      tabIndex={showCreateConversation ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && onClickConversation?.(props)}
    >
      {updateAlert && (
        <div className="icon-wrapper">
          <FaCircle />
        </div>
      )}
      {isDM ? (userId === members[0] ? members[1] : members[0]) : chatId}
    </div>
  );
};

export default SidebarEntry;
