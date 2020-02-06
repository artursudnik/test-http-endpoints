"use strict";
process.chdir(__dirname);

require('dotenv-defaults').config();

const log4js = require('log4js');
log4js.configure(require('./log4js-config'));
const logger = log4js.getLogger('[index]');

const app    = require('./app'),
      server = require('./server');

setupStopRoutines();

server.start(app);

function shutdown(signal, value) {
    logger.info(`shutting down (${128 + value})`);
    process.exit(128 + value);
}

function setupStopRoutines() {
    const signals = {
        'SIGHUP':  1,
        'SIGINT':  2,
        'SIGTERM': 15
    };

    logger.debug(`setting event handlers for signals: ${Object.keys(signals).map(signal => `${signal} (${signals[signal]})`).join(', ')}`);

    let shutdownInitiated = false;

    Object.keys(signals).forEach((signal) => {
        process.on(signal, () => {
            logger.info(`process received a ${signal} (${signals[signal]}) signal`);
            if (shutdownInitiated) {
                logger.warn('Shutdown routine already initiated.');
                return;
            }
            shutdownInitiated = true;
            shutdown(signal, signals[signal]);
        });
    });

    process.on('uncaughtException', function (err) {
        logger.fatal(`Uncaught exception: ${err}`);
        logger.error(err);
        logger.warn('exiting process  after flushing logs');
        log4js.shutdown(() => process.exit(1));
    });

    process.on('unhandledRejection', function (err) {
        logger.fatal(`Unhandled rejection: ${err}`);
        logger.error(err);
        logger.warn('exiting process after flushing logs');
        log4js.shutdown(() => process.exit(1));
    });

    process.on('exit', (code) => {
        console.log(`About to exit with code: ${code}`);
    });
}
