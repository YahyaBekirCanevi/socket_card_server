import Card from "../model/card";
import GameState from "../model/game_state";
import Collections from "../util/collections";

export default class CardService {
  static getCardValue(card: Card): number {
    // Return the value of the card
    // Ace is worth 11 points
    // Face cards are worth 10 points
    // All other cards are worth their face value
    const value = card.value;
    if (value === "A") {
      return 11;
    } else if (["J", "Q", "K"].includes(value)) {
      return 10;
    } else {
      return parseInt(value, 10);
    }
  }

  static buildDeck(game: GameState) {
    const suits = "h,d,c,s".split(","); // hearts,diamonds,clubs,spades
    const values = "A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");
    game.deck = [];

    for (const suit of suits) {
      for (const value of values) {
        game.deck.push({ suit, value });
      }
    }
    this.shuffleDeck(game);
  }

  static shuffleDeck(game: GameState) {
    game.deck = Collections.shuffle<Card>(game.deck);
  }

  static popCardFromDeck(game: GameState): Card {
    return game.deck.pop()!;
  }
}
