import type { Socket } from "socket.io-client";

export const validateUsernames = (
  socket: Socket,
  usernameArray: string[],
  setWarningModalText: React.Dispatch<React.SetStateAction<string>>,
  setWarningModalOpen: React.Dispatch<React.SetStateAction<boolean>>
): Promise<string[] | null> => {
  return new Promise((resolve) => {
    socket.emit(
      "validate-usernames",
      usernameArray,
      (result: string[] | string) => {
        if (typeof result === "string") {
          setWarningModalText(`User "${result}" not found`);
          setWarningModalOpen(true);
          resolve(null);
        } else {
          resolve(result);
        }
      }
    );
  });
};
