import { FaWindowClose } from "react-icons/fa";
import "./CreateConversationForm.css";

interface CreateConversationFormProps {
  showCreateConversation: boolean;
  onClose: () => void;
  onCreate: (e: React.FormEvent<HTMLFormElement>) => void;
  members: string;
  setMembers: React.Dispatch<React.SetStateAction<string>>;
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
}

const CreateConversationForm = ({
  showCreateConversation,
  onClose,
  onCreate,
  members,
  setMembers,
  groupName,
  setGroupName,
}: CreateConversationFormProps) => {
  return (
    <>
      <div
        className={
          showCreateConversation ? "form-wrapper active" : "form-wrapper"
        }
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
          <FaWindowClose />
        </div>
        <form className="create-conversation-form" onSubmit={onCreate}>
          <input
            className="member-list"
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="Members (comma seperated list of user IDs)"
          />
          <input
            className="chat-name"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group chat name (optional for DMs)"
          />
          <button className="submit-form" type="submit">
            Create
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateConversationForm;
