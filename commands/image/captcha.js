const BaseCommand = require("../../lib/structures/bot/Command");

const fetch = require("node-fetch");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "captcha",
            description: "Tworzy twoja własna captche",
            usage: "<p>captcha <tekst>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        const all = await fetch(`https://api.alexflipnote.dev/captcha?text=${encodeURIComponent(args.join(" "))}`, {
            method: "GET",
            headers: { "Authorization": client.config.tokens.apis.alexflipnote },
        }).then(res => res.buffer());
        const attachment = new MessageAttachment(all, "captcha.png");
        const embed = new client.Embed()
            .attachFiles(attachment)
            .setImage(`attachment://captcha.png`);
        message.reply(embed);

    }
};

