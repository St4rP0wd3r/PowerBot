const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "wink",
            aliases: ["mrug", "mrugniecie", "oczko"],
            description: "Wysyła gifa z postacią anime puszczającą oczko",
            usage: "<p>wink",
            category: "Anime",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/animu/wink");
        const attachment = new MessageAttachment(data.link, "wink.png");

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://wink.png"),
        );
    }
};

