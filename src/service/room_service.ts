import GameState from "../model/game_state";
import Player from "../model/player";
import Room from "../model/room";
import Collections from "../util/collections";

export default class RoomService {
  rooms: { [key: string]: Room } = {};

  static createRoom(roomId: string, playerName: string): Room {
    const room = new Room(roomId, playerName);
    this.rooms[roomId] = room;
    return room;
  }

  static isFull(game: GameState): boolean {
    return game.players.length === 4;
  }

  static findPlayer(game: GameState, id: string): Player {
    return Collections.find(game.players, (p) => p.id === id)!;
  }
}
