"use strict";

const log4js = require('log4js');
log4js.configure(require('./log4js-config'));
const logger = log4js.getLogger('[app]');

const async = require('async');

const app = require('express')();

module.exports = app;

const sleep = ms => new Promise(res => setTimeout(res, ms));

app.set('strict routing', true);

app.use((req, res, next) => {
    logger.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.originalUrl} [STARTED]`);

    res.on('finish', () => {
        logger.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.originalUrl} [FINISHED]`)
    });

    res.on('close', () => {
        logger.debug(`[${req.socket.remoteAddress}] ${req.method} ${req.originalUrl} [CLOSED]`)
    });

    next()
});

app.get('/delayed-chunks', async (req, res) => {

    const numberOfChunks = parseInt(req.query.n) || 0,
          delay          = parseInt(req.query.d) || 0;

    await async.timesLimit(numberOfChunks, 1, async (n) => {
        const responseChunk = {
            chunk: n + 1,
            time:  new Date().toISOString()
        };

        if (res.socket.writable === false) {
            return Promise.reject(new Error('connection closed, aborting'));
        }

        logger.debug(`[${req.socket.remoteAddress}] sending chunk ${n + 1}`);

        res.write(JSON.stringify(responseChunk) + '\n');

        if (delay > 0) {
            await sleep(delay);
        }
    }).catch((err) => {
        logger.error(`[${req.socket.remoteAddress}] ${err}`);
    });

    res.end();
});