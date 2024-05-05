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

app.prepare().then(() => {
    server.get('*', (req, res) => {
        return handle(req, res);
    });
    console.log('here');
    io.on('connection', (socket) => {
        console.log('A user connected');

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

        // Example: Listen for messages from clients
        socket.on('message', (message) => {
            console.log('Received message:', message);
            // You can also broadcast to all clients
            socket.broadcast.emit('message', message);
        });
    });

    // Use httpServer to listen instead of express server
    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
