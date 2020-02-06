"use strict";

const path = require('path');

const logsFolder = path.resolve(process.env.LOGS_FOLDER);

module.exports = {
    appenders : {
        stdout: {
            type: 'stdout',
        },
        stderr: {
            type: 'stderr',
        },
        file  : {
            type    : 'dateFile',
            filename: path.join(logsFolder, 'server.log'),
            pattern : '.yyyy-MM-dd'
        }
    },
    categories: {
        default: {
            appenders: ['stdout', 'file'],
            level    : process.env.LOG_LEVEL || 'INFO',
        },
    },
};