"use strict";

const path = require('path');

module.exports = {
    appenders : {
        stdout: {
            type: 'stdout',
        },
        stderr: {
            type: 'stderr',
        }
    },
    categories: {
        default: {
            appenders: ['stdout'],
            level    : process.env.LOG_LEVEL || 'INFO',
        },
    },
};