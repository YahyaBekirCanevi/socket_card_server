const express = require('express');
import * as http from "http"
import * as socketio from "socket.io"
import { v4 as uuidv4 } from 'uuid'

const app = express()

app.get("/", (req: any, res: any) => {
    res.send({ uptime: process.uptime() })
})

const server = http.createServer(app)
const io = new socketio.Server(server)

class Card {
    suit!: string
    value!: string

    constructor(
        suit: string,
        value: string
    ) {
        this.suit = suit
        this.value = value
    }
}

class Player {
    id!: string
    name!: string
    messages!: string[]
    hand!: Card[]
    points!: number

    constructor(
        id: string,
        name: string,
        messages: string[] = [],
        hand: Card[] = [],
        points: number = 0,
    ) {
        this.id = id
        this.name = name
        this.messages = messages
        this.hand = hand
        this.points = points
    }
}

class GameState {
    started!: boolean
    deck!: Card[]
    players!: Player[]
    turn!: string
    winner!: string

    constructor() {
        this.started = false
        this.deck = buildDeck()
        this.players = []
        this.turn = ''
        this.winner = ''
    }
}

class Room {
    name!: string
    users!: string[]

    constructor(
        name: string,
        users: string[],
    ) {
        this.name = name
        this.users = users
    }
}

// Set up a map of rooms
const rooms: { [key: string]: Room } = {}

// Set up a map of game states
const games: { [key: string]: GameState } = {}

server.listen(3000, () => {
    console.log('Socket server listening on port 3000');
})

io.on('connection', (client: socketio.Socket) => {
    console.log(`Socket connected: ${client.id}`)

    client.on('join_room', (roomId: string, playerName: string) => {
        // Leave any existing rooms
        //Object.values(client.rooms).forEach((room) => client.leave(room));

        console.log(`Player Join: ${playerName}`)

        if (!roomId || !games[roomId] || games[roomId].players.length > 4) {
            // Generate a unique room ID
            const roomId = uuidv4()

            // Create a new entry in the rooms map
            rooms[roomId] = {
                name: `${playerName} 's Room`,
                users: [],
            }

            // Create a new entry in the games map
            games[roomId] = {
                started: false,
                deck: [],
                players: [],
                turn: '',
                winner: '',
            }
        }
        // Join the new room
        client.join(roomId);

        rooms[roomId].users.push(client.id);

        io.to(roomId).emit('room_update', { 'id': roomId, 'name': rooms[roomId]['name'] });

        // Add the player to the game
        games[roomId].players.push(new Player(client.id, playerName));

        // Send the updated game state to all sockets
        io.to(roomId).emit('game_state', games[roomId]);
    });

    client.on('disconnect', (roomId: string) => {
        console.log(`Socket disconnected: ${client.id}`);

        // Remove the player from the game
        if (games[roomId] && rooms[roomId]) {
            games[roomId].players = games[roomId].players.filter((p) => p.id !== client.id)
            rooms[roomId].users = rooms[roomId].users.filter((p) => p !== client.id)

            if (games[roomId].players.length < 1) {
                Object.keys(games).filter(e => e !== roomId);
                Object.keys(rooms).filter(e => e !== roomId);
            }

            // Send the updated game state to all sockets
            io.to(roomId).emit('game_state', games[roomId]);
        }
    });

    client.on('start_game', (roomId: string) => {
        // Only allow the game to be started if there are at least 2 players
        if (games[roomId] && games[roomId].players.length >= 2) {
            // Shuffle the deck and deal cards to the players
            games[roomId].deck = shuffle(games[roomId].deck);
            for (let i = 0; i < 5; i++) {
                games[roomId].players.forEach((player) => {
                    let card: Card = games[roomId].deck.pop()!
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

    client.on('end_game', (roomId: string) => {
        if (games[roomId]) {
            // Reset the game state
            games[roomId].started = false
            games[roomId].deck = []
            games[roomId].turn = ''
            games[roomId].winner = ''

            // Send the updated game state to all sockets
            io.to(roomId).emit('game_state', games[roomId])
        }
    });

    client.on('play_card', (card: Card, roomId: string) => {
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

function buildDeck(): Card[] {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }

    return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCardValue(card: Card): number {
    // Return the value of the card
    // Ace is worth 11 points
    // Face cards are worth 10 points
    // All other cards are worth their face value
    const value = card.value;
    if (value === 'A') {
        return 11;
    } else if (['J', 'Q', 'K'].includes(value)) {
        return 10;
    } else {
        return parseInt(value, 10);
    }
}
