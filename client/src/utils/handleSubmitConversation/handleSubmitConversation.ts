import { validateUsernames } from "./validateUsernames";
import type { Socket } from "socket.io-client";

interface handleSubmitConversationProps {
  members: string;
  groupName: string;
  setMembers: React.Dispatch<React.SetStateAction<string>>;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  socket: Socket;
  userId: string;
  setWarningModalText: React.Dispatch<React.SetStateAction<string>>;
  setWarningModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleSubmitConversation = async ({
  members,
  groupName,
  setMembers,
  setGroupName,
  socket,
  userId,
  setWarningModalText,
  setWarningModalOpen,
}: handleSubmitConversationProps) => {
  const memberArray = members.split(",");
  let isDM = false;
  let modifiedGroupName = groupName;
  if (!members) {
    setWarningModalText("Member list cannot be empty");
    setWarningModalOpen(true);
    return;
  }
  const userIdArray = await validateUsernames(
    socket,
    memberArray,
    setWarningModalText,
    setWarningModalOpen
  );

  if (!userIdArray) return;
  if (userIdArray.length === 1) {
    if (!groupName) {
      isDM = true;
      modifiedGroupName = userId + "_" + memberArray[0];
    }
  } else {
    if (!groupName) {
      setWarningModalText("Group name cannot be empty");
      setWarningModalOpen(true);
      return;
    }
  }
  socket.emit(
    "create-conversation",
    modifiedGroupName,
    isDM,
    userIdArray,
    (successful: boolean) => {
      if (!successful) {
        setWarningModalText("Failed to create conversation");
        setWarningModalOpen(true);
      }
      setMembers("");
      setGroupName("");
    }
  );
};
