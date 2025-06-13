import type { Socket } from "socket.io-client";

export const validateUsernames = async (
  socket: Socket,
  usernameArray: string[]
): Promise<boolean> => {
  const checks = usernameArray.map((username) => {
    return new Promise<boolean>((resolve) => {
      socket.emit("validate-username", username, (exists: boolean) => {
        resolve(exists);
      });
    });
  });
  const results = await Promise.all(checks);
  for (let i = 0; i < usernameArray.length; i++) {
    if (!results[i]) {
      alert(`The user "${usernameArray[i]}" does not exist`);
      return false;
    }
  }
  return true;
};
