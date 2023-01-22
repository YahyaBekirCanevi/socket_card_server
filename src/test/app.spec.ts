import { connect, Socket } from 'socket.io-client';
import { expect, use } from "chai";
import { describe, beforeEach, afterEach } from 'mocha';

import { PORT } from '../app'
import Constants from '../utils/constants';

//import chaiHttp from 'chai-http';
//use(chaiHttp)

describe('Suite of unit tests', function () {
    var socket: Socket
    var playerName: string = "TestUser-1"
    var roomId: string = ""

    beforeEach(function (done) {
        // Setup
        socket = connect(`http://localhost:${PORT}`, {
            reconnectionDelay: 0,
            reconnectionDelayMax: 0,
            forceNew: true,
        })
        socket.on('connect', function () {
            console.log('connect...')
            done()
        })
        socket.on('disconnect', function () {
            console.log('disconnected...')
        })
    });

    afterEach(function (done) {
        // Cleanup
        if (socket.connected) {
            console.log('disconnecting...')
            socket.disconnect()
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...')
        }
        done()
    })

    describe('First (hopefully useful) test', function () {
        it('Doing some things with indexOf()', function (done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1)
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1)
            done()
        })
    })

    describe('Join Room test', function () {
        it('Join with name, but no roomId', function (done) {
            const finish = (err: string) => {
                done(err)
                socket.removeListener('room_update', finish)
                socket.removeListener('game_state', finish)
            }

            expect(roomId).to.be.empty
            console.log(`joining... ${roomId} ${playerName}`)

            socket.emit(Constants.JOIN_ROOM, [roomId, playerName])

            // Get room Id
            socket.on('room_update', (data) => {
                console.log(`room_update ${data}`)
                roomId = data['id']
                expect(roomId).to.be.not.empty
                finish("")
            });

            // Listen for game state updates
            socket.on('game_state', (data) => {
                console.log(`game_state ${data}`)
                finish("")
            });
        })
    })
});