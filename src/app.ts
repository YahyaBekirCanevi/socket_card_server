import express from 'express';
import * as http from "http"
import { Socket, Server } from "socket.io"
import SocketController from './socket/controller'
import { games } from './model/game_state';
import { rooms } from './model/room';

export const app = express()

export const PORT = 3000

const server = http.createServer(app)
const io = new Server(server)

app.get("/", (req: any, res: any) => {
    res.send({ uptime: process.uptime(), rooms: rooms, games: games })
})

server.listen(PORT, () => {
    console.log(`Socket server listening on port ${PORT}`);
})

io.on('connection', (client: Socket) => {
    console.log(`Socket connected: ${client.id}`)
    const socketController = new SocketController(client, io)
    socketController.init()
});