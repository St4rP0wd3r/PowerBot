const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "hug",
            aliases: ["przytul", "przytulas"],
            description: "Wysyła gifa przytulających sie postaci anime",
            usage: "<p>hug",
            category: "Anime",
        });
    }

    async run(message) {
        const data = await (await fetch("http://nekos.life/api/hug")).json();
        const attachment = new MessageAttachment(data.url, `hug${data.url.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://hug${data.url.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

