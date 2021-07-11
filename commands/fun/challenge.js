const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "challenge",
            description: "Tworzy obrazek \"challenge complete\" z minecrafta",
            usage: "<p>challenge <tekst>",
            category: "Zabawa",
            args: [{
                name: "tekst",
                ifFail: "Musisz podać poprawny tekst",
                description: "Tekst",
                required: true,
                check: (args => !(!args[0] || args.join(" ").length > 50)),
            }],
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const all = await fetch(`https://api.alexflipnote.dev/challenge?text=${encodeURIComponent(args.join(" "))}`, {
            method: "GET",
            headers: { "Authorization": client.config.tokens.apis.alexflipnote },
        }).then(res => res.buffer());
        const attachment = new MessageAttachment(all, "challenge.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://challenge.png");
        message.reply(embed);

    }
};

