"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const app_1 = require("../app");
const constants_1 = __importDefault(require("../utils/constants"));
//import chaiHttp from 'chai-http';
//use(chaiHttp)
(0, mocha_1.describe)('Suite of unit tests', function () {
    var socket;
    var playerName = "TestUser-1";
    var roomId = "";
    (0, mocha_1.beforeEach)(function (done) {
        // Setup
        socket = (0, socket_io_client_1.connect)(`http://localhost:${app_1.PORT}`, {
            reconnectionDelay: 0,
            reconnectionDelayMax: 0,
            forceNew: true,
        });
        socket.on('connect', function () {
            console.log('connect...');
            done();
        });
        socket.on('disconnect', function () {
            console.log('disconnected...');
        });
    });
    (0, mocha_1.afterEach)(function (done) {
        // Cleanup
        if (socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        }
        else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });
    (0, mocha_1.describe)('First (hopefully useful) test', function () {
        it('Doing some things with indexOf()', function (done) {
            (0, chai_1.expect)([1, 2, 3].indexOf(5)).to.be.equal(-1);
            (0, chai_1.expect)([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });
    });
    (0, mocha_1.describe)('Join Room test', function () {
        it('Join with name, but no roomId', function (done) {
            const finish = (err) => {
                done(err);
                socket.removeListener('room_update', finish);
                socket.removeListener('game_state', finish);
            };
            (0, chai_1.expect)(roomId).to.be.empty;
            console.log(`joining... ${roomId} ${playerName}`);
            socket.emit(constants_1.default.JOIN_ROOM, [roomId, playerName]);
            // Get room Id
            socket.on('room_update', (data) => {
                console.log(`room_update ${data}`);
                roomId = data['id'];
                (0, chai_1.expect)(roomId).to.be.not.empty;
                finish("");
            });
            // Listen for game state updates
            socket.on('game_state', (data) => {
                console.log(`game_state ${data}`);
                finish("");
            });
        });
    });
});
