const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kiss",
            aliases: ["pocaluj", "calus"],
            description: "Wysyła gifa całujących sie postaci anime",
            usage: "<p>kiss",
            category: "Anime",
        });
    }

    async run(message) {
        const data = await (await fetch("http://nekos.life/api/kiss")).json();
        const attachment = new MessageAttachment(data.url, `kiss${data.url.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://kiss${data.url.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

