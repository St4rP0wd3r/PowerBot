const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "suprise",
            description: "Tworzy obrazek \"z piktachu\"",
            usage: "<p>suprise <tekst>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        message.channel.startTyping(1);
        const image = await fetch(`https://api.fc5570.ml/surprised?text=${encodeURIComponent(args.join(" "))}`).then(x => x.buffer())
        message.channel.stopTyping(1);
        const attachment = new MessageAttachment(image, "suprise.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://suprise.png");
        message.reply(embed);

    }
};

