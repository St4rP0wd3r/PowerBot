const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");


const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "supreme",
            description: "Tworzy obrazek supreme",
            usage: "<p>supreme <tekst>",
            category: "Obrazki",
            flags: "`--dark` - Sprawia ze obrazek jest czarny\n`--light` - Sprawia ze obrazek jest biały",
        });
    }

    async run(message, { args, flags, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        const arg = encodeURIComponent(args.join(" "));
        let baseurl = `https://api.alexflipnote.dev/supreme?text=${arg}`;
        if (flags[0] === "dark") baseurl += "&dark=true";
        if (flags[0] === "light") baseurl += "&light=true";

        let all = await fetch(baseurl, {
            method: "GET",
            headers: { "Authorization": client.config.tokens.apis.alexflipnote },
        }).then(res => res.buffer());
        const attachment = new MessageAttachment(all, "supreme.png");

        message.channel.stopTyping(1);
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://supreme.png`);
        message.reply(embed);

    }
};

