import "./DropdownItem.css";
import type { IconType } from "react-icons";

export interface DropdownItemProps {
  label: string;
  action: () => void;
  icon?: IconType;
  removeBottom?: boolean;
  open?: boolean;
  showCreateConversation?: boolean;
}

const DropdownItem = ({
  label,
  action,
  icon: Icon,
  removeBottom = false,
  open = false,
  showCreateConversation = false,
}: DropdownItemProps) => {
  return (
    <li
      className="dropdown-item"
      title={label}
      onClick={action}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          action();
        }
      }}
      style={removeBottom ? { borderBottom: "0" } : {}}
      tabIndex={open && !showCreateConversation ? 0 : -1}
    >
      {label}
      {Icon && (
        <div className="icon-wrapper">
          <Icon />
        </div>
      )}
    </li>
  );
};

export default DropdownItem;
