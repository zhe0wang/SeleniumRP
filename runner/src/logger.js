var chalk = require('chalk'),
    isDebugging;

function setDebugging(debugging) {
    isDebugging = debugging;
};

function success(message) {
    console.log(chalk.green.bold(`Success: ${message}`));
};

function highlight(message) {
    console.log(chalk.black.bgWhite(message));
};

function log(message, isForce) {
    if (isDebugging || isForce) {
        console.log(message);
    }
};

function warn(message, isForce) {
    if (isDebugging || isForce) {
        console.warn(chalk.yellow.bold(`Warn: ${message}`));
    }
};

function error(message) {
    console.error(chalk.red.bold(`Error: ${message}`));
};

function logError(errors) {
    var errorsToLog = [];
    if (errors) {
        errorsToLog = Array.isArray(errors) ? errors : [errors];
    }

    errorsToLog.forEach(function (errorToLog) {
        if (!errorToLog) {
            error('Error occurred!');
            return;
        }

        if (errorToLog && errorToLog.message) {
            error(errorToLog.message);
            return;
        }

        error(JSON.stringify(errorToLog));
    });
}

function message(config) {
    var action = logger[config.type];
    if (action) {
        action(config.message, config.isForce);
    }
}

const Logger = {
    setDebugging: setDebugging,
    success: success,
    highlight: highlight,
    log: log,
    warn: warn,
    error: error,
    logError: logError,
    message: message
};

module.exports = Logger;