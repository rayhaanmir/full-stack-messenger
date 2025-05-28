import { useEffect, useRef, useState } from "react";
import DropdownItem from "../Item/DropdownItem.tsx";
import type { DropdownItemProps } from "../Item/DropdownItem.tsx";
import { FaPlus } from "react-icons/fa";
import "./DropdownContent.css";

export interface DropdownContentProps {
  items: DropdownItemProps[];
  open?: boolean;
}

const DropdownContent = ({ items, open = false }: DropdownContentProps) => {
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
      className={`dropdown-content ${open ? "content-open" : null}`}
      style={open ? { maxHeight: `min(${height}px, 500px)` } : {}}
    >
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const isOnly = items.length === 1;
        return (
          <DropdownItem
            key={index}
            label={item.label}
            action={item.action}
            icon={isOnly || isFirst ? FaPlus : undefined}
            removeBottom={isOnly || isLast}
          />
        );
      })}
    </ul>
  );
};

export default DropdownContent;
