import Card from "./card";

export default class Player {
  id!: string;
  name!: string;
  hand!: Card[];
  points!: number;

  constructor(id: string, name: string, hand: Card[] = [], points: number = 0) {
    this.id = id;
    this.name = name;
    this.hand = hand;
    this.points = points;
  }
}
