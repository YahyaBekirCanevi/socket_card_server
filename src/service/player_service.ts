import Card from "../model/card";
import GameState from "../model/game_state";
import Player from "../model/player";
import CardService from "./card_service";

export default class PlayerService {
  static playCard(player: Player, card: Card) {
    // Remove the card from the player's hand
    player.hand = player.hand.filter((c) => c !== card);

    // Add the card to the player's points
    player.points += CardService.getCardValue(card);
  }

  static getCardFromDeck(gameState: GameState, player: Player) {
    const card: Card = CardService.popCardFromDeck(gameState);
    player.hand.push(card);
  }
}
