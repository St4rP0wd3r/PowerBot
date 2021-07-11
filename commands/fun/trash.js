const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "trash",
            description: "Wyrzuca użytkownika",
            usage: "<p>trash [użytkownik]",
            category: "Zabawa",
            args: [{
                name: "użytkownik",
                ifFail: "Musisz podać poprawnego użytkownika",
                description: "Użytkownik",
                required: false,
                check: async (args, { message }) => {
                    if (!args[0]) return true;
                    return await client.functions.getUser(message, args[0]);
                },
            }],

        });
    }

    async run(message, { args }) {
        const member = await client.functions.getUser(message, args[0]) || message.author;

        const all = await fetch(`https://api.alexflipnote.dev/trash?face=${message.author.displayAvatarURL(ImageURLOptions).replace("?size=1024", "")}&trash=${member.displayAvatarURL(ImageURLOptions).replace("?size=1024", "")}`, {
            method: "GET",
            headers: { "Authorization": client.config.tokens.apis.alexflipnote },
        });
        const img = await all.buffer();

        const attachment = new MessageAttachment(img, "trash.png");

        const embed = new client.Embed(message)
            .setDescription(`${message.author.username} wyrzuca ${member.username}`)
            .attachFiles(attachment)
            .setImage(`attachment://trash.png`);
        message.reply(embed);
    }


};

