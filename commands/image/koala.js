const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "koala",
            aliases: ["koal", "koale"],
            description: "Wysyła zdjęcie koali",
            usage: "<p>koala",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/koala");
        const attachment = new MessageAttachment(data.link, `koala${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://koala${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

