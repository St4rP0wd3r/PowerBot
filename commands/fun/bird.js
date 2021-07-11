const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "ptaki",
            aliases: ["ptak", "ptaszek", "bird", "birds", "birb"],
            description: "Wysyła zdjęcie ptaka (tym razem nie chodzi o kutasa ( ͡° ͜ʖ ͡°))",
            usage: "<p>kot",
            category: "Zabawa",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/birb");
        const attachment = new MessageAttachment(data.link, `bird${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://bird${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

