import { Socket, Server } from "socket.io"
import { v4 as uuidv4 } from 'uuid'
import Card from "../model/card"
import GameState, { games } from '../model/game_state'
import Player from "../model/player"
import Room, { rooms } from "../model/room"
import Constants from "../utils/constants"

export default class SocketController {
    client: Socket
    io: Server

    constructor(
        client: Socket,
        io: Server
    ) {
        this.client = client
        this.io = io
    }

    init() {
        this.client.on(Constants.JOIN_ROOM, (roomId: string, playerName: string) => this.joinRoom(roomId, playerName))
        this.client.on(Constants.DISCONNECT, () => this.disconnect())
        this.client.on(Constants.START_GAME, (roomId: string) => this.startGame(roomId))
        this.client.on(Constants.END_GAME, (roomId: string) => this.endGame(roomId))
        this.client.on(Constants.PLAY_CARD, (roomId: string, card: Card) => this.playCard(roomId, card))
    }


    joinRoom(roomId: string, playerName: string) {
        if (this.client.rooms?.values.length > 0) {
            // Leave any existing rooms
            Object.values(this.client.rooms).forEach((room) => this.client.leave(room));
        }
        if (!roomId || roomId === "" || !games[roomId] || games[roomId].isFull()) {
            roomId = this.createGameRoom(playerName)
        }
        // Join the new room
        this.client.join(roomId);

        // Add the player to the game
        games[roomId].players.push(new Player(this.client.id, playerName));

        this.updateGame(roomId)

        rooms[roomId].users.push(this.client.id);

        this.updateRoom(roomId)
    }

    disconnect() {
        console.log(`Socket disconnected: ${this.client.id}`);

        const index = Object.values(rooms).findIndex(e => {
            return e.users.find(el => el === this.client.id)!
        })
        //console.log(`index : ${index}`)
        const roomId: string = Object.keys(rooms).at(index)!

        // Remove the player from the game
        if (games[roomId] && rooms[roomId]) {
            games[roomId].players = games[roomId].players.filter((p) => p.id !== this.client.id)
            rooms[roomId].users = rooms[roomId].users.filter((p) => p !== this.client.id)

            // Delete room if there is no player left
            if (games[roomId].players.length < 1) {
                delete games[roomId];
                delete rooms[roomId];

                // Send the updated game state to all sockets
                this.updateGame(roomId)
            } else if (games[roomId].players.length < 2) {
                this.endGame(roomId)
            }
            this.client.leave(roomId)
        }
    }

    startGame(roomId: string) {
        // Only allow the game to be started if there are at least 2 players
        if (games[roomId] && games[roomId].players.length >= 2) {
            // Shuffle the deck and deal cards to the players
            games[roomId].startGame()

            // Send the updated game state to all sockets
            this.updateGame(roomId)
        }
    }

    endGame(roomId: string) {
        if (games[roomId]) {
            // Reset the game state
            games[roomId].endGame()

            // Send the updated game state to all sockets
            this.updateGame(roomId)
        }
    }

    playCard(roomId: string, card: Card) {
        if (games[roomId]) {
            // Get the current player
            const player = games[roomId].findPlayer(this.client.id)

            if (player && games[roomId].turn === this.client.id) {
                player.playCard(card)

                // Check if the player has won
                if (player.points >= 21) {
                    games[roomId].winner = player.id;
                }

                // Set the next player's turn
                games[roomId].setNextTurn(this.client.id)

                // Send the updated game state to all sockets
                this.updateGame(roomId)
            }
        }
    }

    createGameRoom(playerName: string): string {
        // Create uinque roomId
        const roomId = uuidv4()

        // Create a new entry in the rooms map
        rooms[roomId] = new Room(playerName)

        // Create a new entry in the games map
        games[roomId] = new GameState()

        return roomId
    }

    playerSockets(roomId: string) {
        return !games[roomId] ? [] : games[roomId].players.map(e => e.id)
    }

    updateGame(roomId: string) {
        const sockets = this.playerSockets(roomId)
        // Send the updated game state to all sockets
        this.io.to(sockets).emit(Constants.GAME_STATE, games[roomId]);
    }

    updateRoom(roomId: string) {
        const sockets = this.playerSockets(roomId)

        const room = {
            'id': roomId,
            'name': rooms[roomId].name
        }
        // Send new room to all sockets
        this.io.to(sockets).emit(Constants.ROOM, room);
    }
}