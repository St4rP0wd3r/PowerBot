const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kot",
            aliases: ["koty", "cat", "cats", "pchlarz", "pchlarze"],
            description: "Wysyła zdjęcie kotka",
            usage: "<p>kot",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/cat");
        const attachment = new MessageAttachment(data.link, `cat${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://cat${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

