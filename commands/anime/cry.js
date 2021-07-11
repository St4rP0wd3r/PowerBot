const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "cry",
            aliases: ["placz"],
            description: "Wysyła gifa płączącej postaci",
            usage: "<p>cry",
            category: "Anime",
        });
    }

    async run(message) {
        const data = await (await fetch("https://neko-love.xyz/api/v1/cry")).json();
        const attachment = new MessageAttachment(data.url, `hug${data.url.endsWith(".gif") ? ".gif" : ".png"}`);
        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://hug${data.url.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

