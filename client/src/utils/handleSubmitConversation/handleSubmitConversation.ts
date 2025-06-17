import { validateUsernames } from "./validateUsernames";
import type { Socket } from "socket.io-client";

interface handleSubmitConversationProps {
  members: string;
  groupName: string;
  setMembers: React.Dispatch<React.SetStateAction<string>>;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  socket: Socket;
  userId: string;
}

export const handleSubmitConversation = async ({
  members,
  groupName,
  setMembers,
  setGroupName,
  socket,
  userId,
}: handleSubmitConversationProps) => {
  const memberArray = members.split(",");
  let isDM = false;
  let modifiedGroupName = groupName;
  if (memberArray.length === 0) {
    alert("Member list cannot be empty");
    return;
  }
  const userIdArray = await validateUsernames(socket, memberArray);
  if (!userIdArray) return;
  if (userIdArray.length === 1) {
    if (!groupName) {
      isDM = true;
      modifiedGroupName = userId + "_" + memberArray[0];
    }
  } else {
    if (!groupName) {
      alert("Group name cannot be empty");
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
        alert("Failed to create conversation");
      }
      setMembers("");
      setGroupName("");
    }
  );
};
