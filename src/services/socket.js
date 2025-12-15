import { io } from "socket.io-client";

const SOCKET_URL = "http://10.241.80.208:5000";

if (!SOCKET_URL) {
  console.warn("SOCKET_URL is undefined");
}

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
