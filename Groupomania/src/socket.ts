import { io } from "socket.io-client";

const URL = "http://185.224.139.102:3000";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
});

export default socket;