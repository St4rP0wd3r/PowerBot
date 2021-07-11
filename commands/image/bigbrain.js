const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "bigbrain",
            description: "Tworzy mem bigbrain",
            usage: "<p>bigbrain <tekst 1>; <tekst 2>; <tekst 3>; <tekst 4>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.join(" ").includes(";")) return sender.argsError(this.help.usage, prefix, "<tekst 1>");

        const text1 = args.join(" ").split(";")[0].trim();
        const text2 = args.join(" ").split(";")[1].trim();
        const text3 = args.join(" ").split(";")[2].trim();
        const text4 = args.join(" ").split(";")[3].trim();
        if (!text1) return sender.argsError(this.help.usage, prefix, "<tekst 1>");
        if (!text2) return sender.argsError(this.help.usage, prefix, "<tekst 2>");
        if (!text3) return sender.argsError(this.help.usage, prefix, "<tekst 3>");
        if (!text4) return sender.argsError(this.help.usage, prefix, "<tekst 4>");
        message.channel.startTyping(1)
        const all = await fetch(`https://api.fc5570.ml/bigbrain?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}&text4=${encodeURIComponent(text4)}`, {
            method: "GET",
        }).then(res => res.buffer());
        message.channel.stopTyping(1)
        const attachment = new MessageAttachment(all, "bigbrain.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://bigbrain.png");
        message.reply(embed);

    }
};

