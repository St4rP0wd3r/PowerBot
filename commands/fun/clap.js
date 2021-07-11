const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "clap",
            aliases: ["klap"],
            description: "Dodaje emotkę :clap: między spacjami.",
            usage: "<p>clap <tekst>",
            category: "Zabawa",
            args: [{
                name: "tekst",
                ifFail: "Musisz podać poprawny tekst",
                description: "Tekst",
                required: true,
                check: (args => !(!args[0] || args.length < 2 || args.join(" ").length < 2048)),
            }],
        });
    }

    async run(message, { args, prefix }) {
        message.reply(new client.Embed(message)
            .setDescription(args.join("👏").toRandomCase()),
        );
    }
};

