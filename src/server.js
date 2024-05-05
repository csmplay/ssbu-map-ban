const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require("socket.io");
const createServer = require("next");

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer);
let maps = [];

app.prepare().then(() => {
    server.get('*', (req, res) => {
        return handle(req, res);
    });
    console.log('here');
    io.on('connection', (socket) => {
        console.log('A user connected');
        if (maps !== null) {
            socket.emit('image-ban', maps);
        }
        const heartbeatInterval = setInterval(() => {
            socket.emit('heartbeat', { beat: 1 });
        }, 10000);

        socket.on('heartbeat', (msg) => {
            console.log('Heartbeat received', msg);
            console.log('From: ', socket.client.id);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            clearInterval(heartbeatInterval);
        });

        socket.on('image-ban', (selectedImages) => {
            console.log('Updated selection of images:', selectedImages);
            maps = selectedImages;
            socket.broadcast.emit('image-ban', selectedImages);
        })
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
