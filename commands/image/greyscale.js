const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "greyscale",
            description: "Naklada szara nakladke na avatar użytkownika",
            usage: "<p>greyscale [user]",
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
        const image = await canvacord.Canvas.greyscale(member.displayAvatarURL(ImageURLOptions));
        const attachment = new MessageAttachment(image, "greyscale.png");

        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://greyscale.png");
        message.reply(embed);

    }
};

