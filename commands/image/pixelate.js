const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "pixelate",
            description: "Pikseluje avatar użytkownika",
            usage: "<p>pixelate [user]",
            category: "Obrazki",
        });
    }

    async run(message, { args }) {
        const member = await client.functions.getUser(message, args[0]) || message.author;

        const image = await canvacord.Canvas.pixelate(member.displayAvatarURL(ImageURLOptions), 5);
        const attachment = new MessageAttachment(image, "pixelate.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://pixelate.png");
        message.reply(embed);

    }
};

