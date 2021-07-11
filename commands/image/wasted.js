const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "wasted",
            description: "Naklada filtr wasted z gta na avatar użytkownika",
            usage: "<p>wasted <user>",
            category: "Obrazki",
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

        const displayAvatarURL = member.displayAvatarURL(ImageURLOptions).replace(".webp", ".png").replace(".gif", ".png").replace("?size=1024", "");

        const attachment = new MessageAttachment(`https://some-random-api.ml/canvas/wasted?avatar=${displayAvatarURL}`, "wasted.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://wasted.png`);
        message.reply(embed);

    }
};

