import { IoMdCloseCircle } from "react-icons/io";
import "./CreateConversationForm.css";

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
  return (
    <>
      <div
        className={`form-wrapper${showCreateConversation ? " active" : ""}`}
        onTransitionEnd={(e) => {
          if (e.propertyName === "top") {
            if (!showCreateConversation) {
              setRenderCreate(false);
            }
          }
        }}
      >
        <div
          className="icon-close-wrapper"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onClose();
            }
          }}
          tabIndex={0}
        >
          <IoMdCloseCircle />
        </div>
        <form className="create-conversation-form" onSubmit={onCreate}>
          <input
            className="member-list"
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value.trim())} // trim prevents users from typing spaces
            placeholder="Members (comma seperated list of user IDs)"
            tabIndex={0}
          />
          <input
            className="chat-name"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group chat name (optional for DMs)"
            tabIndex={0}
          />
          <button className="submit-form" type="submit" tabIndex={0}>
            Create
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateConversationForm;
