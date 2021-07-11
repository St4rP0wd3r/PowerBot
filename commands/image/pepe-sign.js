const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "pepesign",
            aliases: ["pepe-sign"],
            description: "Tworzy tabliczke trzymaną przez pepe",
            usage: "<p>pepesign <tekst>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        if (args.join(" ").length > 19) return sender.argsError(this.help.usage, prefix, "<tekst>", "Tekst musi być krótszy niż 19 znaków");
        message.channel.startTyping(1);
        const image = await fetch(`https://api.fc5570.ml/pepeSign?text=${encodeURIComponent(args.join(" "))}`).then(x => x.buffer())
        message.channel.stopTyping(1);
        const attachment = new MessageAttachment(image, "pepesign.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://pepesign.png");
        message.reply(embed);

    }
};

