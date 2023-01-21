"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(id, name, messages = [], hand = [], points = 0) {
        this.id = id;
        this.name = name;
        this.messages = messages;
        this.hand = hand;
        this.points = points;
    }
    playCard(card) {
        // Remove the card from the player's hand
        this.hand = this.hand.filter((c) => c !== card);
        // Add the card to the player's points
        this.points += this.getCardValue(card);
    }
    getCardFromDeck(gameState) {
        const card = gameState.popCardFromDeck();
        this.hand.push(card);
    }
    getCardValue(card) {
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
}
exports.default = Player;
