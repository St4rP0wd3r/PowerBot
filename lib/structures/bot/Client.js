const { Client, Collection } = require("discord.js-light");
const Config = require("../../config");

module.exports = class client extends Client {
    constructor(options) {
        super(options);
        this.config = Config;

        this.commands = new Collection();
        this.aliases = new Collection();
        this.events = new Collection();
        this.snipes = new Collection();
        this.slashCommands = new Collection();
        this.Embed = require("./Embed");

        this.Sender = require("./Sender");

        this.functions = require("../../functions");

        this.version = "v2";

    }
};