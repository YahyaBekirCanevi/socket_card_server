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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const http = __importStar(require("http"));
const socketio = __importStar(require("socket.io"));
const uuid_1 = require("uuid");
const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}
class Player {
    constructor(id, name, messages = [], hand = [], points = 0) {
        this.id = id;
        this.name = name;
        this.messages = messages;
        this.hand = hand;
        this.points = points;
    }
}
class GameState {
    constructor() {
        this.started = false;
        this.deck = buildDeck();
        this.players = [];
        this.turn = '';
        this.winner = '';
    }
}
class Room {
    constructor(name, users) {
        this.name = name;
        this.users = users;
    }
}
// Set up a map of rooms
const rooms = {};
// Set up a map of game states
const games = {};
app.get("/", (req, res) => {
    res.send({ uptime: process.uptime(), rooms: rooms, games: games });
});
server.listen(3000, () => {
    console.log('Socket server listening on port 3000');
});
io.on('connection', (client) => {
    console.log(`Socket connected: ${client.id}`);
    client.on('join_room', (roomId, playerName) => {
        // Leave any existing rooms
        Object.values(client.rooms).forEach((room) => client.leave(room));
        if (!roomId || !games[roomId] || games[roomId].players.length > 4) {
            // Create uinque roomId
            roomId = (0, uuid_1.v4)();
            // Create a new entry in the rooms map
            rooms[roomId] = {
                name: `${playerName} 's Room`,
                users: [],
            };
            // Create a new entry in the games map
            games[roomId] = {
                started: false,
                deck: [],
                players: [],
                turn: '',
                winner: '',
            };
        }
        console.log(`Player Join ${playerName}`);
        // Join the new room
        client.join(roomId);
        // Add the player to the game
        games[roomId].players.push(new Player(client.id, playerName));
        // Send the updated game state to all sockets
        io.to(roomId).emit('game_state', games[roomId]);
        rooms[roomId].users.push(client.id);
        io.to(roomId).emit('room_update', {
            'id': roomId,
            'name': rooms[roomId].name
        });
    });
    client.on('disconnect', () => {
        console.log(`Socket disconnected: ${client.id}`);
        let index = Object.values(rooms)
            .findIndex(e => e.users.find(el => el === client.id));
        console.log(`index : ${index}`);
        const roomId = Object.keys(rooms).at(index);
        // Remove the player from the game
        if (games[roomId] && rooms[roomId]) {
            games[roomId].players = games[roomId].players.filter((p) => p.id !== client.id);
            rooms[roomId].users = rooms[roomId].users.filter((p) => p !== client.id);
            if (games[roomId].players.length < 1) {
                Object.keys(games).filter(e => e !== roomId);
                Object.keys(rooms).filter(e => e !== roomId);
            }
            // Send the updated game state to all sockets
            io.to(roomId).emit('game_state', games[roomId]);
        }
        client.leave(roomId);
    });
    client.on('start_game', (roomId) => {
        // Only allow the game to be started if there are at least 2 players
        if (games[roomId] && games[roomId].players.length >= 2) {
            // Shuffle the deck and deal cards to the players
            games[roomId].deck = shuffle(games[roomId].deck);
            for (let i = 0; i < 5; i++) {
                games[roomId].players.forEach((player) => {
                    let card = games[roomId].deck.pop();
                    player.hand.push(card);
                });
            }
            // Set the first player's turn
            games[roomId].turn = games[roomId].players[0].id;
            // Set the game to started
            games[roomId].started = true;
            // Send the updated game state to all sockets
            io.to(roomId).emit('game_state', games[roomId]);
        }
    });
    client.on('end_game', (roomId) => {
        if (games[roomId]) {
            // Reset the game state
            games[roomId].started = false;
            games[roomId].deck = [];
            games[roomId].turn = '';
            games[roomId].winner = '';
            // Send the updated game state to all sockets
            io.to(roomId).emit('game_state', games[roomId]);
        }
    });
    client.on('play_card', (roomId, card) => {
        if (games[roomId]) {
            // Get the current player
            const player = games[roomId].players.find((p) => p.id === client.id);
            if (player && games[roomId].turn === client.id) {
                // Remove the card from the player's hand
                player.hand = player.hand.filter((c) => c !== card);
                // Add the card to the player's points
                player.points += getCardValue(card);
                // Check if the player has won
                if (player.points >= 21) {
                    games[roomId].winner = player.id;
                }
                // Set the next player's turn
                const currentIndex = games[roomId].players.findIndex((p) => p.id === client.id);
                games[roomId].turn = games[roomId].players[(currentIndex + 1) % games[roomId].players.length].id;
                // Send the updated game state to all sockets
                io.to(roomId).emit('game_state', games[roomId]);
            }
        }
    });
});
function buildDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return shuffle(deck);
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getCardValue(card) {
    // Return the value of the card
    // Ace is worth 11 points
    // Face cards are worth 10 points
    // All other cards are worth their face value
    const value = card.value;
    if (value === 'A') {
        return 11;
    }
    else if (['J', 'Q', 'K'].includes(value)) {
        return 10;
    }
    else {
        return parseInt(value, 10);
    }
}