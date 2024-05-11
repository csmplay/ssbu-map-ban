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
let states = 0;

app.prepare().then(() => {
    server.get('*', (req, res) => {
        return handle(req, res);
    });
    console.log('here');
    io.on('connection', (socket) => {
        console.log('A user connected');
        if (bannedMaps.length !== 0) {
            socket.emit('image-ban', bannedMaps);
            socket.emit('pick', pickedMaps);
            socket.emit('game');
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
            console.log('Updated selection of images:', selectedImages);
            bannedMaps = selectedImages;
            socket.broadcast.emit('image-ban', selectedImages);
            if (states === 0) {
                socket.broadcast.emit('game');
            }
        })

        socket.on('reset', () => {
            console.log('Reset all bans');
            socket.broadcast.emit('reset');
            bannedMaps = [];
            pickedMaps = [];
            states = 0;
        })

        socket.on('turn', () => {
            console.log(socket.client.id, 'made a turn');
            states += 1;
            console.log(states, 'sent');
            socket.emit('stateUpdate', states);
            socket.broadcast.emit('turn', states);
        })
        
        socket.on('pick', (data) => {
            console.log(socket.client.id, ' picked maps: ', data);
            pickedMaps = data;
            socket.broadcast.emit('pick', data);
        })
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
