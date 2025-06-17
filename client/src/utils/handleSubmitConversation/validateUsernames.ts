import type { Socket } from "socket.io-client";

export const validateUsernames = (
  socket: Socket,
  usernameArray: string[]
): Promise<string[] | null> => {
  return new Promise((resolve) => {
    socket.emit(
      "validate-usernames",
      usernameArray,
      (result: string[] | string) => {
        if (typeof result === "string") {
          alert(`User "${result}" not found`);
          resolve(null);
        } else {
          resolve(result);
        }
      }
    );
  });
};
