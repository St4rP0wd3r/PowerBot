const { readdirSync } = require("fs");
const Database = require("./database");

module.exports = class Lib {
    constructor() {
        console = require("./modules/console");
        console.log("Attemp to start library");
    }

    get modules() {
        return this._mapDir("modules");
    }

    get structures() {
        return this._mapDir("structures");
    }

    async init(bot) {
        console.log("Library started");
        bot.database = new Database();
        bot.database.init();
        global.client = bot;
        require("../dashboard").init();
        require("./structures/components").init();
        for (const i of readdirSync("./src/lib/handlers/")) require("./handlers/" + i).init();
        for (const i of readdirSync("./src/lib/extenedStructures/")) require("./extenedStructures/" + i);
        for (const i of readdirSync("./src/lib/intervals/")) require("./intervals/" + i)();
    }


    _mapDir(dir) {
        const dirs = {};
        for (const file of readdirSync(`./src/lib/${dir}`)) dirs[file.split(".")[0]] = require(`./${dir}/${file}`);
        return dirs;
    }
};