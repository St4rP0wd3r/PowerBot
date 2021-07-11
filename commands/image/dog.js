const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "pies",
            aliases: ["psy", "pieski", "sierściuchy", "kundel", "dog", "dogs", "piesobronny"],
            description: "Wysyła zdjęcie kotka",
            usage: "<p>kot",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/dog");
        const attachment = new MessageAttachment(data.link, "dog.png");

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://dog.png"),
        );
    }
};

