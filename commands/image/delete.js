const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({

            name: "delete",
            aliases: ["usuń"],
            description: "Usuwa użytkownika",
            usage: "<p>delete <user>",
            category: "Obrazki",
        });
    }

    async run(message, { args }) {
        const member = await client.functions.getUser(message, args[0]) || message.author;
        const image = await canvacord.Canvas.delete(member.displayAvatarURL(ImageURLOptions));
        const attachment = new MessageAttachment(image, "delete.png");

        const embed = new client.Embed(message)
            .setDescription(`<:check_green:814098229712781313> Usunieto użytkownika ${member.username}`)
            .attachFiles(attachment)
            .setImage("attachment://delete.png");
        message.reply(embed);

    }
};

