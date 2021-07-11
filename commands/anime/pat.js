const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "pat",
            aliases: ["poglaskaj", "poglaszcz", "pogłaszcz", "patpat", "pat-pat"],
            description: "Wysyła gifa z głaskaniem postaci anime XD",
            usage: "<p>pat",
            category: "Anime",
        });
    }

    async run(message) {
        const data = await (await fetch("http://nekos.life/api/pat")).json();
        const attachment = new MessageAttachment(data.url, `pat${data.url.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://pat${data.url.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

