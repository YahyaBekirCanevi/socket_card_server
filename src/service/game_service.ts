import GameState from "../model/game_state";
import PlayerService from "./player_service";

export default class GameService {
  static games: { [key: string]: GameState } = {};

  static getGame(roomId: string): GameState {
    return this.games[roomId];
  }

  static createGame(roomId: string): GameState {
    const game = new GameState();
    this.games[roomId] = game;
    return game;
  }

  static startGame(game: GameState) {
    for (let i = 0; i < 5; i++) {
      game.players.forEach((player) =>
        PlayerService.getCardFromDeck(game, player)
      );
    }
    // Set the first player's turn
    game.turn = game.players[0].id;

    // Set the game to started
    game.started = true;
  }

  static endGame(game: GameState) {
    game.started = false;
    game.deck = [];
    game.turn = "";
    game.winner = "";
  }

  static setNextTurn(game: GameState, currentPlayerId: string) {
    // Set the next player's turn
    const currentIndex = game.players.findIndex(
      (p) => p.id === currentPlayerId
    );
    game.turn = game.players[(currentIndex + 1) % game.players.length].id;
  }
}
