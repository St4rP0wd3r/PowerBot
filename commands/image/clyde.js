const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "clyde",
            description: "Tworzy wiadomosc wyslana od clyde",
            usage: "<p>clyde <tekst>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");

        message.channel.startTyping(1);
        const body = await client.functions.getJsonFromApi(`https://nekobot.xyz/api/imagegen?type=clyde&text=${encodeURIComponent(args.join(" "))}`);
        message.channel.stopTyping(1);
        const attachment = new MessageAttachment(`${body.message}`, "clyde.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://clyde.png`);
        message.reply(embed);

    }
};

