const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "triggered",
            description: "Naklada flitr triggered na awatar oznaczonego",
            usage: "<p>triggered [user]",
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

        const avatar = member.displayAvatarURL({ dynamic: false, format: "png" });
        const image = await canvacord.Canvas.trigger(avatar);
        const attachment = new MessageAttachment(image, "triggered.gif");
        message.channel.startTyping(1);
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://triggered.gif`);
        message.reply(embed);
        message.channel.stopTyping(1);

    }
};

