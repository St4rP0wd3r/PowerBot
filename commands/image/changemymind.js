const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "changemymind",
            aliases: ["cmm"],
            description: "Tworzy obrazek \"changemymind\"",
            usage: "<p>changemymind <tekst>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        message.channel.startTyping(1);
        const cmm = await client.functions.getJsonFromApi(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${encodeURIComponent(args.join(" "), message)}`);
        message.channel.stopTyping(1);
        const attachment = new MessageAttachment(`${cmm.message}`, "cmm.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://cmm.png");
        message.reply(embed);

    }
};

