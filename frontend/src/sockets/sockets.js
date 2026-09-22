import { io } from "socket.io-client";

export const socket = io("http://locahhost:8080", {
  withCredentials: true,
  autoConnect: false,
});
