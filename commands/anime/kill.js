const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kill",
            aliases: ["zabij"],
            description: "Wysyła gifa zabijających sie postaci anime",
            usage: "<p>kill",
            category: "Anime",
        });
    }

    async run(message) {

        const links = [
            "https://cdn.weeb.sh/images/HyXTiyKw-.gif",
            "https://cdn.weeb.sh/images/r11as1tvZ.gif",
            "https://cdn.weeb.sh/images/B1qosktwb.gif",
            "https://cdn.weeb.sh/images/BJO2j1Fv-.gif",
            "https://cdn.weeb.sh/images/B1VnoJFDZ.gif",
        ];

        const data = links.random();
        const attachment = new MessageAttachment(data, `kill${data.endsWith(".gif") ? ".gif" : ".png"}`);

        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://kill${data.endsWith(".gif") ? ".gif" : ".png"}`),
        );
    }
};

