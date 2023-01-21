"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.games = void 0;
class GameState {
    constructor() {
        this.started = false;
        //this.deck = []
        this.players = [];
        this.turn = '';
        this.winner = '';
        this.buildDeck();
    }
    buildDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push({ suit, value });
            }
        }
        this.shuffleDeck();
    }
    shuffleDeck() {
        this.deck = GameState.shuffle(this.deck);
    }
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    isFull() {
        return this.players.length === 4;
    }
    findPlayer(id) {
        return this.players.find((p) => p.id === id);
    }
    startGame() {
        this.shuffleDeck();
        for (let i = 0; i < 5; i++) {
            this.players.forEach((player) => player.getCardFromDeck(this));
        }
        // Set the first player's turn
        this.turn = this.players[0].id;
        // Set the game to started
        this.started = true;
    }
    endGame() {
        this.started = false;
        this.deck = [];
        this.turn = '';
        this.winner = '';
    }
    popCardFromDeck() {
        return this.deck.pop();
    }
    setNextTurn(currentPlayerId) {
        // Set the next player's turn
        const currentIndex = this.players.findIndex((p) => p.id === currentPlayerId);
        this.turn = this.players[(currentIndex + 1) % this.players.length].id;
    }
}
exports.default = GameState;
// Set up a map of game states
exports.games = {};
