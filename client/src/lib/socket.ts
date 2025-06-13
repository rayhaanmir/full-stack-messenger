import { io } from "socket.io-client";

const socket = io("http://192.168.1.30:3000", {
  auth: (cb) => cb({ accessToken: localStorage.getItem("accessToken") ?? "" }),
});

export default socket;
