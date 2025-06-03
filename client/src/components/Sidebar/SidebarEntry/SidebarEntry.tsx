import "./SidebarEntry.css";

export interface SidebarEntryProps {
  _id: string;
  chatId: string;
  isDM: boolean;
  members: string[];
  lastMessage: string;
  lastUpdated: number;
  showCreateConversation?: boolean;
  idLoaded: string | undefined;
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
    idLoaded,
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
      {isDM ? members[0] : chatId}
    </div>
  );
};

export default SidebarEntry;
