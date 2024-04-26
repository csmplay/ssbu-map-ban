const express = require('express');
const next = require('next');
const sockjs = require('sockjs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const sockServer = sockjs.createServer();

app.prepare().then(() => {

    sockServer.on('connection', (conn) => {
        // Your SockJS connection logic
    });

    server.use('/sock', sockServer.middleware());

    server.get('*', (req, res) => handle(req, res));

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
