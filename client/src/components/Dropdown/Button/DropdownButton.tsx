import { FaChevronUp } from "react-icons/fa";
import "./DropdownButton.css";

interface DropdownButtonProps {
  text: string;
  setOpen: (value: React.SetStateAction<boolean>) => void;
  open: boolean;
}

const DropdownButton = ({ text, setOpen, open }: DropdownButtonProps) => {
  return (
    <div
      className={`dropdown-btn ${open ? "button-open" : ""}`}
      onClick={() => setOpen((open) => !open)}
    >
      {text}
      <span className="toggle-icon">
        <FaChevronUp className={`arrow ${open ? "spin" : ""}`} />
      </span>
    </div>
  );
};

export default DropdownButton;
