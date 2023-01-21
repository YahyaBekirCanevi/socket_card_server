import GameState from "./game_state"
import Card from "./card"

export default class Player {
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

    playCard(card: Card) {
        // Remove the card from the player's hand
        this.hand = this.hand.filter((c) => c !== card);

        // Add the card to the player's points
        this.points += this.getCardValue(card);
    }

    getCardFromDeck(gameState: GameState) {
        const card: Card = gameState.popCardFromDeck()
        this.hand.push(card);
    }

    getCardValue(card: Card): number {
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
}