"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const app_1 = require("../src/app");
//import chaiHttp from 'chai-http';
//use(chaiHttp)
(0, mocha_1.describe)('Suite of unit tests', function () {
    var socket;
    (0, mocha_1.beforeEach)(function (done) {
        // Setup
        socket = (0, socket_io_client_1.connect)(`http://localhost:${app_1.PORT}`, {
            reconnectionDelay: 0,
            reconnectionDelayMax: 0,
            forceNew: true,
        });
        socket.on('connect', function () {
            console.log('connect...');
        });
        socket.on('disconnect', function () {
            console.log('disconnected...');
        });
        done();
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
        it('Doing something else with indexOf()', function (done) {
            (0, chai_1.expect)([1, 2, 3].indexOf(5)).to.be.equal(-1);
            (0, chai_1.expect)([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });
    });
});
