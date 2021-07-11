const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "lis",
            aliases: ["lisy", "furrasyirl", "jebacfurry", "liski"],
            description: "Wysyła zdjęcie ptaka",
            usage: "<p>kot",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await (await fetch("https://some-random-api.ml/img/fox")).json();
        const attachment = new MessageAttachment(data.link, `fox${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://fox${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

