"use strict";

const log4js = require('log4js');
log4js.configure(require('./log4js-config'));
const logger = log4js.getLogger('[app]');

const async  = require('async'),
      crypto = require('crypto');

const app = require('express')();

module.exports = app;

const sleep = ms => new Promise(res => {
    if (ms === 0) {
        return setImmediate(res);
    }
    setTimeout(res, ms);
});

app.set('strict routing', true);
app.enable('trust proxy');

app.use((req, res, next) => {
    logger.debug(`[${req.ip}] ${req.method} ${req.originalUrl} [STARTED]`);

    res.on('finish', () => {
        logger.debug(`[${req.ip}] ${req.method} ${req.originalUrl} [FINISHED]`)
    });

    res.on('close', () => {
        logger.debug(`[${req.ip}] ${req.method} ${req.originalUrl} [CLOSED]`)
    });

    next()
});

app.get('/delayed-chunks', async (req, res) => {

    const numberOfChunks = parseInt(req.query.n) || 0,
          delay          = parseInt(req.query.d) || 0;

    const chunkNumberLength = `${numberOfChunks}`.length;

    let chunksSent         = 0,
        lastCountDisplayed = new Date();

    let countInterval = setInterval(() => {
        logger.debug(`[${req.ip}] ${chunksSent} chunks sent since ${lastCountDisplayed.toISOString()}`);
        lastCountDisplayed = new Date();
        chunksSent = 0;
    }, 1000);

    res.set('Content-Type', 'application/json-seq');

    await async.timesLimit(numberOfChunks, 1, async (n) => {
        const responseChunk = {
            chunk : n + 1,
            time  : new Date().toISOString(),
            random: randomStringHex(100)
        };

        if (res.socket.writable === false) {
            return Promise.reject(new Error('connection closed, aborting'));
        }

        res.write(JSON.stringify(responseChunk) + '\n');

        chunksSent++;

        await sleep(delay);
    }).catch((err) => {
        logger.error(`[${req.ip}] ${err}`);
    });

    logger.debug(`[${req.ip}] ${chunksSent} chunks sent since ${lastCountDisplayed.toISOString()}`);
    clearInterval(countInterval);

    res.end();
});

app.get('/bogus-endpoint', (req, res) => {
    res.status(204).send();
});

app.get('/paginate', (req, res) => {
    const pageNumber = parseInt(req.query.pageNumber);

    const response = {
        items:   pageNumber < 11 ? Array(10).fill(null).map((e, i) => ({id: pageNumber * 10 + i + 1})) : [],
        hasNext: pageNumber < 10,
        nextPage: pageNumber < 10 ? pageNumber + 1 : null
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response, null, 4));
});

app.post('/consumer', (req, res) => {
    console.log(JSON.stringify(req.headers));
    res.send({status: "OK"})
});

function randomStringHex(length) {
    return crypto.randomBytes(length).toString('hex');
}