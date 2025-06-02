import type { SidebarEntryProps } from "./SidebarEntry/SidebarEntry.tsx";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import "./Sidebar.css";
import SidebarEntry from "./SidebarEntry/SidebarEntry.tsx";
import type { Socket } from "socket.io-client";

interface SidebarProps {
  SidebarEntries: SidebarEntryProps[];
  fullWidth: boolean;
  setAnimateSidebarWidth: React.Dispatch<React.SetStateAction<boolean>>;
  setFullWidth: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateConversation: React.Dispatch<React.SetStateAction<boolean>>;
  setRenderCreate: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateConversation: boolean;
  idLoaded: string | undefined;
  setConversationLoaded: React.Dispatch<
    React.SetStateAction<SidebarEntryProps | null>
  >;
  onClickConversation: (entry: SidebarEntryProps) => void;
}

const Sidebar = ({
  SidebarEntries,
  setAnimateSidebarWidth,
  setFullWidth,
  setShowCreateConversation,
  setRenderCreate,
  showCreateConversation,
  idLoaded,
  setConversationLoaded,
  onClickConversation,
}: SidebarProps) => {
  return (
    <>
      <div
        className="sidebar-wrapper"
        style={
          showCreateConversation
            ? { filter: "blur(0.1rem)", pointerEvents: "none" }
            : {}
        }
      >
        <div className="button-row" title="Create a new conversation">
          <button
            className="create-button"
            onClick={() => {
              setRenderCreate(true);
              requestAnimationFrame(() => setShowCreateConversation(true));
            }}
            tabIndex={showCreateConversation ? -1 : 0}
          >
            Create conversation
            <FaPlus />
          </button>
          <button
            className="close-button"
            title="Close this sidebar"
            onClick={() => {
              setAnimateSidebarWidth(true);
              setFullWidth(true);
            }}
            tabIndex={showCreateConversation ? -1 : 0}
          >
            <FaArrowLeft />
          </button>
        </div>
        <div className="entries-wrapper">
          {SidebarEntries.map((item, index) => {
            return (
              <SidebarEntry
                key={index}
                {...item}
                showCreateConversation={showCreateConversation}
                idLoaded={idLoaded}
                onClickConversation={onClickConversation}
              />
            );
          })}
          <div
            className="empty-space"
            onClick={() => setConversationLoaded(null)}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
