const { MessageEmbed, MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "redpanda",
            aliases: ["red-pandy", "red-panda"],
            description: "Wysyła zdjęcie pandy.",
            usage: "<p>panda",
            category: "Obrazki",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/img/red_panda");
        const attachment = new MessageAttachment(data.link, `red-panda${data.link.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://red-panda${data.link.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

