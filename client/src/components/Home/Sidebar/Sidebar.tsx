import type { SidebarEntryProps } from "./SidebarEntry/SidebarEntry.tsx";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import "./Sidebar.css";
import SidebarEntry from "./SidebarEntry/SidebarEntry.tsx";

interface SidebarProps {
  SidebarEntries: SidebarEntryProps[];
  fullWidth: boolean;
  setAnimateSidebarWidth: React.Dispatch<React.SetStateAction<boolean>>;
  setFullWidth: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateConversation: React.Dispatch<React.SetStateAction<boolean>>;
  setRenderCreate: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  showCreateConversation: boolean;
  idLoaded: string | undefined;
  setConversationLoaded: React.Dispatch<
    React.SetStateAction<SidebarEntryProps | null>
  >;
  onClickConversation: (entry: SidebarEntryProps) => void;
  isMobile: boolean;
  setRenderSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  animateSidebarWidth: boolean;
}

const Sidebar = ({
  SidebarEntries,
  fullWidth,
  setAnimateSidebarWidth,
  setFullWidth,
  setShowCreateConversation,
  setRenderCreate,
  userId,
  showCreateConversation,
  idLoaded,
  setConversationLoaded,
  onClickConversation,
  isMobile,
  setRenderSidebar,
  animateSidebarWidth,
}: SidebarProps) => {
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (isMobile) {
      if (e.propertyName === "width") {
        setAnimateSidebarWidth(false);
        if (fullWidth) {
          setRenderSidebar(false);
        }
      }
    }
  };

  const sidebarWrapperProps: {
    className: string;
    style: { filter: string; pointerEvents: "none" } | {};
    onTransitionEnd: (e: React.TransitionEvent<HTMLDivElement>) => void;
  } = {
    className: `sidebar-wrapper${
      isMobile && animateSidebarWidth ? " animate" : ""
    }`,
    style: {
      width: isMobile && fullWidth ? "0" : "16rem",
      zIndex: isMobile ? "1" : "inherit",
      pointerEvents: showCreateConversation ? "none" : "auto",
      filter: showCreateConversation ? "blur(0.1rem)" : "none",
    },
    onTransitionEnd: handleTransitionEnd,
  };

  const createButtonProps = {
    className: "create-button",
    onClick: () => {
      setRenderCreate(true);
      requestAnimationFrame(() => setShowCreateConversation(true));
    },
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const closeButtonProps = {
    className: "close-button",
    title: "Close this sidebar",
    onClick: () => {
      setAnimateSidebarWidth(true);
      setFullWidth(true);
    },
    tabIndex: showCreateConversation ? -1 : 0,
  };

  const emptySpaceProps = {
    className: "empty-space",
    onClick: () => setConversationLoaded(null),
  };

  const conversations = SidebarEntries.map((item) => {
    return (
      <SidebarEntry
        key={item._id}
        {...item}
        userId={userId}
        showCreateConversation={showCreateConversation}
        idLoaded={idLoaded}
        onClickConversation={onClickConversation}
      />
    );
  });

  return (
    <>
      <div {...sidebarWrapperProps}>
        <div className="button-row" title="Create a new conversation">
          <button {...createButtonProps}>
            Create conversation
            <FaPlus />
          </button>
          <button {...closeButtonProps}>
            <FaArrowLeft />
          </button>
        </div>
        <div className="entries-wrapper">
          {conversations}
          <div {...emptySpaceProps} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
