const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "panda",
            aliases: ["pandy", "pandzia"],
            description: "Wysyła zdjęcie pandy.",
            usage: "<p>panda",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/panda");
        const attachment = new MessageAttachment(data.link, `panda${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://panda${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

