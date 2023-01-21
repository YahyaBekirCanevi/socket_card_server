"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const controller_1 = __importDefault(require("./socket/controller"));
const game_state_1 = require("./model/game_state");
const room_1 = require("./model/room");
exports.app = (0, express_1.default)();
exports.PORT = 3000;
const server = http.createServer(exports.app);
const io = new socket_io_1.Server(server);
exports.app.get("/", (req, res) => {
    res.send({ uptime: process.uptime(), rooms: room_1.rooms, games: game_state_1.games });
});
server.listen(exports.PORT, () => {
    console.log(`Socket server listening on port ${exports.PORT}`);
});
io.on('connection', (client) => {
    console.log(`Socket connected: ${client.id}`);
    const socketController = new controller_1.default(client, io);
    socketController.init();
});
