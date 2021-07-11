const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "target",
            description: "Targetuje użytkownika",
            usage: "<p>target [user]",
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
        const image = await fetch(`https://api.fc5570.ml/snipe?image=${avatar}`, {
            method: "GET",
        }).then(res => res.buffer());
        const attachment = new MessageAttachment(image, "target.gif");
        message.channel.startTyping(1);
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://target.gif`);
        message.reply(embed);
        message.channel.stopTyping(1);

    }
};

