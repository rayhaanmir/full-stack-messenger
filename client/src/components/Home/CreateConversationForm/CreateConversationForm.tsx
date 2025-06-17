import { IoMdCloseCircle } from "react-icons/io";
import "./CreateConversationForm.css";
import { useEffect, useRef } from "react";

interface CreateConversationFormProps {
  onClose: () => void;
  onCreate: (e: React.FormEvent<HTMLFormElement>) => void;
  members: string;
  setMembers: React.Dispatch<React.SetStateAction<string>>;
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  setRenderCreate: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateConversation: boolean;
}

const CreateConversationForm = ({
  onClose,
  onCreate,
  members,
  setMembers,
  groupName,
  setGroupName,
  setRenderCreate,
  showCreateConversation,
}: CreateConversationFormProps) => {
  const formWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formWrapperRef.current &&
        !formWrapperRef.current.contains(event.target as Node)
      )
        onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formBackgroundProps = {
    className: `form-background${showCreateConversation ? " active" : ""}`,
  };

  const formWrapperProps = {
    ref: formWrapperRef,
    className: `form-wrapper${showCreateConversation ? " active" : ""}`,
    onTransitionEnd: (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName === "top") {
        if (!showCreateConversation) {
          setRenderCreate(false);
        }
      }
    },
  };

  const iconCloseWrapperProps = {
    className: "icon-close-wrapper",
    onClick: onClose,
    onKeyDown: (e: React.KeyboardEvent<HTMLSpanElement>) =>
      e.key === "Enter" && onClose(),
    tabIndex: 0,
  };

  const memberListProps = {
    className: "member-list",
    type: "text",
    value: members,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setMembers(e.target.value.replace(/\s/g, "")), // prevent users from typing/pasting whitespaces
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
      e.key === " " && e.preventDefault(), // ignore typed spaces
    placeholder: "Members (comma-seperated list of user IDs)",
    tabIndex: 0,
  };

  const chatNameProps = {
    className: "chat-name",
    type: "text",
    value: groupName,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setGroupName(e.target.value),
    placeholder: "Group chat name (optional for DMs)",
    tabIndex: 0,
  };

  return (
    <div {...formBackgroundProps}>
      <div {...formWrapperProps}>
        <div {...iconCloseWrapperProps}>
          <IoMdCloseCircle />
        </div>
        <form className="create-conversation-form" onSubmit={onCreate}>
          <input {...memberListProps} />
          <input {...chatNameProps} />
          <button className="submit-form" type="submit" tabIndex={0}>
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateConversationForm;
