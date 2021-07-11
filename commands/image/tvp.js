const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "tvp",
            aliases: ["polskatelewizja", "polska-telewizja"],
            description: "Wysyła wiadomości z twoim tekstem.",
            usage: "<p>tvp",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args[0]) return sender.argsError(this.help.usage, prefix, "<tekst>");
        if (args.join(" ").length > 44) return sender.argsError(this.help.usage, prefix, "<tekst>", "Tekst nie może być dłuższy niż 44 znaki");
        const body = [];
        body.push(`fimg=${encodeURIComponent(Math.floor(Math.random() * 2))}`);
        body.push(`msg=${encodeURIComponent(args.join(" "))}`);
        const image = await fetch("https://pasek-tvpis.pl", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.join("&"),
        });
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const attachment = new MessageAttachment(buffer, "tvp.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://tvp.png");
        message.reply(embed);
        message.channel.stopTyping(1);
    }
};

