import { io } from "socket.io-client";

const host = import.meta.env.VITE_SERVER_IP;
const port = import.meta.env.VITE_SERVER_PORT;

const socket = io(`http://${host}:${port}`, {
  autoConnect: false,
  auth: (cb) => cb({ accessToken: localStorage.getItem("accessToken") ?? "" }),
});

export default socket;
