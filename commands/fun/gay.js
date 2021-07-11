const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "gay",
            aliases: ["gej", "gejcheck", "pedau", "ciepły"],
            description: "Robi z kogoś geja",
            usage: "<p>gay [Użytkownik]",
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
        const link = `https://some-random-api.ml/canvas/gay/?avatar=${mentioned.displayAvatarURL({ format: "png" })}`;
        const attachment = new MessageAttachment(link, `gay.png`);
        message.reply(new client.Embed(message)
            .attachFiles(attachment)
            .setImage(`attachment://gay.png`),
        );
    }
};

