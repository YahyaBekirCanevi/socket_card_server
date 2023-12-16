import Card from "./card";
import Player from "./player";

export default class GameState {
  started!: boolean;
  deck!: Card[];
  players!: Player[];
  turn!: string;
  winner!: string;

  constructor() {
    this.started = false;
    this.deck = [];
    this.players = [];
    this.turn = "";
    this.winner = "";
  }
}
