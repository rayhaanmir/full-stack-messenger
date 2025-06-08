import { useState } from "react";
import DropdownContent from "./Content/DropdownContent.tsx";
import DropdownButton from "./Button/DropdownButton.tsx";
import type { DropdownContentProps } from "./Content/DropdownContent.tsx";
import "./Dropdown.css";

interface DropdownProps {
  buttonText: string;
  content?: DropdownContentProps;
  showCreateConversation: boolean;
}

const Dropdown = ({
  buttonText,
  content = { items: [] },
  showCreateConversation,
}: DropdownProps) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="dropdown">
      <DropdownButton
        text={buttonText}
        setOpen={setOpen}
        open={open}
        showCreateConversation={showCreateConversation}
      />
      <DropdownContent
        {...content}
        open={open}
        showCreateConversation={showCreateConversation}
      />
    </div>
  );
};

export default Dropdown;
