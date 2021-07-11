const chalk = require("chalk");
const { inspect } = require("util");
module.exports = {
    clear: console.clear,
    test: console.log,
    oWarn: console.warn,
    oErr: console.error,
    assert: console.assert,
    log: (text) => console.test(`[${chalk.green(new Date().toLocaleTimeString())}]: ${text}`),
    warn: (text) => console.oWarn(`[${chalk.yellow(new Date().toLocaleTimeString())}]: ${text}`),
    error: (error) => console.oErr(`[${chalk.red(new Date().toLocaleTimeString())}]: ${typeof error === "object" ? inspect(error, { depth: 0 }) : error}`),
};