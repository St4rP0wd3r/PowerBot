const Client = require("./lib/structures/bot/Client");
const Lib = require("./lib");
const client = new Client({
    cacheGuilds: true,
    cacheChannels: true,
    cacheOverwrites: true,
    cacheRoles: true,
    cacheEmojis: true,
    cachePresences: false,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
global.ImageURLOptions = { dynamic: true, size: 1024, format: "png" };
client.login(client.config.tokens.main);
const lib = new Lib();
client.lib = lib;
setTimeout(() => lib.init(client), 500);