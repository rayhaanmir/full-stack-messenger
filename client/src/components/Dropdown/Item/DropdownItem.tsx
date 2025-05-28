import { useState } from "react";
import "./DropdownItem.css";
import type { IconType } from "react-icons";

export interface DropdownItemProps {
  label: string;
  action: () => void;
  icon?: IconType;
  removeBottom?: boolean;
}

const DropdownItem = ({
  label,
  action,
  icon: Icon,
  removeBottom = false,
}: DropdownItemProps) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <li
      className="dropdown-item"
      title={label}
      onClick={action}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={
        removeBottom
          ? {
              backgroundColor: hovered ? "#7f7f7f" : "transparent",
              borderBottom: "0",
            }
          : { backgroundColor: hovered ? "#7f7f7f" : "transparent" }
      }
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
