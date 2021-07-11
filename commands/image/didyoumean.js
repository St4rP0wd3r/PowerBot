const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

class Didyoumean extends BaseCommand {
    constructor() {
        super({
            name: "dym",
            aliases: ["didyoumine"],
            description: "Tworzy obrazek \"Did You Mean?\" z google",
            usage: "<p>dym <text 1>; <text 2>",
            category: "Obrazki",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.join(" ").includes(";")) return sender.argsError(this.help.usage, prefix, "<tekst 1>");

        const firstArg = args.join(" ").split(";")[0].trim();
        const secondArg = args.join(" ").split(";")[1].trim();

        if (!firstArg) return sender.argsError(this.help.usage, prefix, "<tekst 1>");
        if (!secondArg) return sender.argsError(this.help.usage, prefix, "<tekst 2>");
        let all = await fetch(`https://api.alexflipnote.dev/didyoumean?top=${encodeURIComponent(firstArg)}&bottom=${encodeURIComponent(secondArg)}`, {
            method: "GET",
            headers: { "Authorization": client.config.tokens.apis.alexflipnote },
        }).then(res => res.buffer());
        const attachment = new MessageAttachment(all, "didyoumean.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://didyoumean.png");
        message.reply(embed);

    }
}

module.exports = Didyoumean;