const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "achievement",
            description: "Tworzy obrazek \"achievement get\" z minecrafta",
            category: "Zabawa",
            usage: "<p>achievement <tekst>",
            args: [{
                name: "tekst",
                ifFail: "Musisz podać poprawny tekst",
                description: "Tekst",
                required: true,
                check: (args => !(!args[0] || args.join(" ").length > 50)),
            }],
        });

    }

    async run(message, { args }) {
        const data = await (await fetch(`https://api.alexflipnote.dev/achievement?text=${encodeURIComponent(args.join(" "))}`, { headers: { "Authorization": client.config.tokens.apis.alexflipnote } })).buffer();
        const attachment = new MessageAttachment(data, "achievement.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://achievement.png`);
        message.reply(embed);

    }
};

