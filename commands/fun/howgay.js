const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "howgay",
            aliases: ["hg"],
            description: "Na ile % jesteś gejem?",
            usage: "<p>howgay [użytkownik]",
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
        const gay = Math.floor(Math.random() * 101);
        const embed = new client.Embed(message)
            .setDescription(`Użytkownik ${member.tag} jest gejem na: \`${gay}%\``);
        message.reply(embed);

    }
};


