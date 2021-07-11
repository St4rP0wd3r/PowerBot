const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");
const { MessageEmbed, MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "blur",
            description: "Naklada nakladke \"blur\" na avatar użytkownika",
            usage: "<p>blur [user]",
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
        const image = await canvacord.Canvas.blur(member.displayAvatarURL(ImageURLOptions));
        const attachment = new MessageAttachment(image, "blur.png");

        const embed = new client.Embed()
            .attachFiles(attachment)
            .setImage("attachment://blur.png");
        message.reply(embed);

    }
};

