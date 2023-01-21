"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = void 0;
class Room {
    constructor(playerName) {
        this.name = `${playerName} 's Room`;
        this.users = [];
    }
}
exports.default = Room;
// Set up a map of rooms
exports.rooms = {};
