const { MessageEmbed, MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "colorfy",

            description: "Wysyła avatar użytkownika w podanym kolorze HEX",
            usage: "<p>colorfy <hex> [użytkownik]",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<hex>");
        const member = await client.functions.getUser(message, args[1]) || message.author;
        if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(args[0])) return sender.argsError(this.help.usage, prefix, "<hex>", "Podany kolor musi być w formacie hex (`#xxxxxx`)");
        const image = await canvacord.Canvas.colorfy(member.displayAvatarURL(ImageURLOptions), args[0]);

        const attachment = new MessageAttachment(image, "colorfy.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://colorfy.png");
        message.reply(embed);

    }
};

