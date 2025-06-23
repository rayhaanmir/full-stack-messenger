import { FaCircle } from "react-icons/fa";
import "./SidebarEntry.css";

export interface SidebarEntryProps {
  _id: string;
  conversationName: string;
  isDM: boolean;
  members: string[];
  lastUser: string;
  lastMessage: string;
  lastUpdated: number;
  createTime: number;
  username?: string;
  showCreateConversation?: boolean;
  idLoaded?: string | undefined;
  updateAlert?: boolean;
  onClickConversation?: (entry: SidebarEntryProps) => void;
  newMessageCount: number;
}

const SidebarEntry = (props: SidebarEntryProps) => {
  const {
    _id,
    conversationName,
    isDM,
    members,
    lastUser,
    lastMessage,
    lastUpdated,
    createTime,
    username,
    showCreateConversation,
    idLoaded,
    updateAlert = false,
    onClickConversation,
    newMessageCount = 0,
  } = props;

  const entryProps = {
    className: "entry",
    style:
      idLoaded === _id
        ? {
            fontStyle: isDM ? "auto" : "italic",
            backgroundColor: "#757575",
          }
        : { fontStyle: isDM ? "auto" : "italic" },
    onClick: () => idLoaded !== _id && onClickConversation?.(props),
    tabIndex: showCreateConversation ? -1 : 0,
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
      e.key === "Enter" && onClickConversation?.(props),
    title: newMessageCount
      ? newMessageCount === 1
        ? `1 new message`
        : `${newMessageCount} new messages`
      : "",
  };

  return (
    <div {...entryProps}>
      {updateAlert && (
        <div className="icon-wrapper">
          <FaCircle />
        </div>
      )}
      {isDM
        ? username === members[0]
          ? members[1]
          : members[0]
        : conversationName}
    </div>
  );
};

export default SidebarEntry;
