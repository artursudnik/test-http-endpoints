"use strict";

const log4js = require('log4js');
log4js.configure(require('./log4js-config'));
const logger = log4js.getLogger('[server]');

const http = require('http');

const PORT = process.env.PORT || 3000,
      BIND = process.env.BIND || '127.0.0.1';

let server;

module.exports = {
    start(app) {
        if (server) return server;

        server = http.createServer(app);

        server
            .on('listening', () => logger.info(`listening on port ${PORT}, bind to ${BIND}`))
            .on('connection', socket => {
                logger.debug(`connection from ${socket.remoteAddress}:${socket.remotePort}`);
                socket.on('close', (error) => {
                    logger.debug(`connection from ${socket.remoteAddress}:${socket.remotePort} closed ${error ? 'with error' : ''}`);
                })
            })
            .on('close', () => {
                logger.info('server closed');
            })
            .listen(PORT, BIND);
    }
};

