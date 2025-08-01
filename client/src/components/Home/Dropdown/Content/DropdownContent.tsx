import { useEffect, useRef, useState } from "react";
import DropdownItem from "../Item/DropdownItem.tsx";
import type { DropdownItemProps } from "../Item/DropdownItem.tsx";
import "./DropdownContent.css";

export interface DropdownContentProps {
  items: DropdownItemProps[];
  open?: boolean;
  showCreateConversation?: boolean;
}

const DropdownContent = ({
  items,
  open = false,
  showCreateConversation = false,
}: DropdownContentProps) => {
  const [height, setHeight] = useState<number>(0);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (ref.current && open) {
      setHeight(ref.current.scrollHeight);
    }
  }, [open, items.length]);
  return (
    <ul
      ref={ref}
      className={`dropdown-content${open ? " content-open" : ""}`}
      style={
        open
          ? { maxHeight: `min(${height}px, 500px)`, pointerEvents: "auto" }
          : {}
      }
      tabIndex={-1}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <DropdownItem
            key={index}
            label={item.label}
            action={item.action}
            removeBottom={isLast}
            open={open}
            showCreateConversation={showCreateConversation}
          />
        );
      })}
    </ul>
  );
};

export default DropdownContent;
