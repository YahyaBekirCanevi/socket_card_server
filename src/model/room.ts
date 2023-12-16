import GameService from "../service/game_service";
import GameState from "./game_state";
import Player from "./player";

export default class Room {
  id!: string,
  name!: string;
  game!: GameState;

  constructor(roomId: string, playerName: string) {
    this.id = roomId;
    this.name = `${playerName} 's Room`;
    this.game = GameService.createGame(playerName);
  }

  addPlayer(player: Player): void {
    this.game.players.push(player);
  }

  removePlayer(playerId: string): void {
    this.game.players = this.game.players.filter((player) => player.id !== playerId);
  }
}
