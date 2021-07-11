const { MessageEmbed, MessageAttachment } = require("discord.js-light");

const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "glass",
            aliases: ["szklo", "szkło"],
            description: "Robi z kogoś geja",
            usage: "<p>glass [Użytkownik]",
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
        const mentioned = await client.functions.getUser(message, args[0]) || message.author;
        const link = `https://some-random-api.ml/canvas/glass/?avatar=${mentioned.displayAvatarURL({ format: "png" })}`;
        const attachment = new MessageAttachment(link, "glass.png");

        message.reply(new MessageEmbed()
            .attachFiles(attachment)
            .setImage("attachment://glass.png"),
        );
    }
};

