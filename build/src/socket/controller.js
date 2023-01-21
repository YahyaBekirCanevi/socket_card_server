"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const game_state_1 = __importStar(require("../model/game_state"));
const player_1 = __importDefault(require("../model/player"));
const room_1 = __importStar(require("../model/room"));
//// EVENTS
const JOIN_ROOM = 'join_room';
const DISCONNECT = 'disconnect';
const START_GAME = 'start_game';
const END_GAME = 'end_game';
const PLAY_CARD = 'play_card';
//// EMITS
const GAME_STATE = 'game_state';
const ROOM = 'room';
class SocketController {
    constructor(client, io) {
        this.client = client;
        this.io = io;
    }
    init() {
        this.client.on(JOIN_ROOM, this.joinRoom);
        this.client.on(DISCONNECT, this.disconnect);
        this.client.on(START_GAME, this.startGame);
        this.client.on(END_GAME, this.endGame);
        this.client.on(PLAY_CARD, this.playCard);
    }
    joinRoom(roomId, playerName) {
        // Leave any existing rooms
        Object.values(this.client.rooms).forEach((room) => this.client.leave(room));
        if (!roomId || !game_state_1.games[roomId] || game_state_1.games[roomId].isFull()) {
            roomId = this.createRoom(playerName);
        }
        // Join the new room
        this.client.join(roomId);
        // Add the player to the game
        game_state_1.games[roomId].players.push(new player_1.default(this.client.id, playerName));
        this.updateGame(roomId);
        room_1.rooms[roomId].users.push(this.client.id);
        this.updateRoom(roomId);
    }
    disconnect() {
        console.log(`Socket disconnected: ${this.client.id}`);
        const index = Object.values(room_1.rooms).findIndex(e => {
            return e.users.find(el => el === this.client.id);
        });
        //console.log(`index : ${index}`)
        const roomId = Object.keys(room_1.rooms).at(index);
        // Remove the player from the game
        if (game_state_1.games[roomId] && room_1.rooms[roomId]) {
            game_state_1.games[roomId].players = game_state_1.games[roomId].players.filter((p) => p.id !== this.client.id);
            room_1.rooms[roomId].users = room_1.rooms[roomId].users.filter((p) => p !== this.client.id);
            // Delete room if there is no player left
            if (game_state_1.games[roomId].players.length < 1) {
                delete game_state_1.games[roomId];
                delete room_1.rooms[roomId];
                // Send the updated game state to all sockets
                this.updateGame(roomId);
            }
            else if (game_state_1.games[roomId].players.length < 2) {
                this.endGame(roomId);
            }
        }
        this.client.leave(roomId);
    }
    startGame(roomId) {
        // Only allow the game to be started if there are at least 2 players
        if (game_state_1.games[roomId] && game_state_1.games[roomId].players.length >= 2) {
            // Shuffle the deck and deal cards to the players
            game_state_1.games[roomId].startGame();
            // Send the updated game state to all sockets
            this.updateGame(roomId);
        }
    }
    endGame(roomId) {
        if (game_state_1.games[roomId]) {
            // Reset the game state
            game_state_1.games[roomId].endGame();
            // Send the updated game state to all sockets
            this.updateGame(roomId);
        }
    }
    playCard(roomId, card) {
        if (game_state_1.games[roomId]) {
            // Get the current player
            const player = game_state_1.games[roomId].findPlayer(this.client.id);
            if (player && game_state_1.games[roomId].turn === this.client.id) {
                player.playCard(card);
                // Check if the player has won
                if (player.points >= 21) {
                    game_state_1.games[roomId].winner = player.id;
                }
                // Set the next player's turn
                game_state_1.games[roomId].setNextTurn(this.client.id);
                // Send the updated game state to all sockets
                this.updateGame(roomId);
            }
        }
    }
    createRoom(playerName) {
        // Create uinque roomId
        const roomId = (0, uuid_1.v4)();
        // Create a new entry in the rooms map
        room_1.rooms[roomId] = new room_1.default(playerName);
        // Create a new entry in the games map
        game_state_1.games[roomId] = new game_state_1.default();
        return roomId;
    }
    playerSockets(roomId) {
        return game_state_1.games[roomId].players.map(e => e.id);
    }
    updateGame(roomId) {
        const sockets = this.playerSockets(roomId);
        // Send the updated game state to all sockets
        this.io.to(sockets).emit(GAME_STATE, game_state_1.games[roomId]);
    }
    updateRoom(roomId) {
        const sockets = this.playerSockets(roomId);
        const room = {
            'id': roomId,
            'name': room_1.rooms[roomId].name
        };
        // Send new room to all sockets
        this.io.to(sockets).emit(ROOM, room);
    }
}
exports.default = SocketController;
