import { connect, Socket } from 'socket.io-client';
import { expect, use } from "chai";
import { describe, beforeEach, afterEach } from 'mocha';

import { app, PORT } from '../app'

//import chaiHttp from 'chai-http';
//use(chaiHttp)

describe('Suite of unit tests', function () {
    var socket: Socket

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
        //done()
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
    });

    describe('First (hopefully useful) test', function () {
        it('Doing some things with indexOf()', function (done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1)
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1)
            done()
        });

        it('Doing something else with indexOf()', function (done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1)
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1)
            done()
        });
    });
});