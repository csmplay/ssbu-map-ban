const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require("socket.io");
require("next");
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer);
let bannedMaps = [];
let pickedMaps = [];
let shadowMaps = [];
let lockedMaps = [];
let oppLockedMaps = [];
let states = 0;
let frenID = "";
let playing = false;

app.prepare().then(() => {
    server.get(/(.*)/, (req, res) => {
        return handle(req, res);
    });

    server.use(express.static('public'));

    io.on('connection', (socket) => {
        console.log('A user connected');

        if (playing) {
            socket.emit('image-ban', bannedMaps);
            socket.emit('pick', pickedMaps);
            socket.emit('shadow', shadowMaps);
            socket.emit('game');
            socket.emit('lock', [lockedMaps, oppLockedMaps]);
            socket.emit('opp');
            socket.emit('stateUpdate', states);
        }

        const heartbeatInterval = setInterval(() => {
            socket.emit('heartbeat');
        }, 10000);

        socket.on('heartbeat', () => {
            console.log('Heartbeat received');
            console.log('From: ', socket.client.id);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            clearInterval(heartbeatInterval);
        });

        socket.on('image-ban', (selectedImages) => {
            playing = true;
            console.log('Updated selection of images:', selectedImages);
            bannedMaps = selectedImages;
            socket.broadcast.emit('image-ban', selectedImages);
            if (states === 0) {
                socket.broadcast.emit('game');
            }
        });

        socket.on('reset', () => {
            console.log('Reset all bans');
            socket.broadcast.emit('reset');
            bannedMaps = [];
            pickedMaps = [];
            shadowMaps = [];
            lockedMaps = [];
            oppLockedMaps = [];
            states = 0;
            playing = false;
        });

        socket.on('newMap', () => {
            console.log('New Map');
            socket.broadcast.emit('newMap');
            bannedMaps = [];
            pickedMaps = [];
            shadowMaps = [];
            states = 4
        })

        socket.on('loop', () => {
            states = 2;
        })

        socket.on('turn', () => {
            console.log(socket.client.id, 'made a turn');
            states += 1;
            console.log(states, 'sent');
            socket.emit('stateUpdate', states);
            socket.broadcast.emit('turn', states);
        });
        
        socket.on('pick', (data) => {
            console.log(socket.client.id, ' picked maps: ', data);
            pickedMaps = data;
            socket.broadcast.emit('pick', data);
        });

        socket.on('shadow', (data) => {
            console.log(socket.client.id, 'shadow maps:', data);
            shadowMaps = data;
            socket.broadcast.emit('shadow', shadowMaps);
        });

        socket.on('lock', (data) => {
                console.log(data);
                if (lockedMaps.length === 0) {
                    frenID = socket.client.id;
                    lockedMaps = data;
                    socket.broadcast.emit('opp');
                    socket.broadcast.emit('lock', [lockedMaps, oppLockedMaps]);
                } else {
                    if (socket.client.id === frenID) {
                        lockedMaps = data;
                    } else {
                        oppLockedMaps = data;
                    }
                    socket.broadcast.emit('lock', [lockedMaps, oppLockedMaps]);
                }
                cnt = 0;
        });
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
