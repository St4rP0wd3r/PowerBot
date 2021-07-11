const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "pikachu",
            aliases: ["pikaczu", "pikachuj"],
            description: "Wysyła zdjęcie pikachu",
            usage: "<p>kot",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/pikachu");
        const attachment = new MessageAttachment(data.link, `pikachu${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://pikachu${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

