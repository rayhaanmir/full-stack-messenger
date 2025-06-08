import { FaChevronUp } from "react-icons/fa";
import "./DropdownButton.css";

interface DropdownButtonProps {
  text: string;
  setOpen: (value: React.SetStateAction<boolean>) => void;
  open: boolean;
  showCreateConversation: boolean;
}

const DropdownButton = ({
  text,
  setOpen,
  open,
  showCreateConversation,
}: DropdownButtonProps) => {
  return (
    <div
      className={`dropdown-btn ${open ? "button-open" : ""}`}
      onClick={() => setOpen((open) => !open)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          setOpen((open) => !open);
        }
      }}
      tabIndex={!showCreateConversation ? 0 : -1}
    >
      {text}
      <div
        className="toggle-icon"
        style={open ? { transform: "rotate(180deg)" } : {}}
      >
        <FaChevronUp />
      </div>
    </div>
  );
};

export default DropdownButton;
