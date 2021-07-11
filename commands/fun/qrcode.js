const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "qrcode",
            aliases: ["qr"],
            description: "Tworzy kod qr",
            usage: "<p>qrcode <tekst>",
            category: "Zabawa",
            args: [{
                name: "użytkownik",
                ifFail: "Musisz podać poprawnego użytkownika",
                description: "Użytkownik",
                required: true,
                check: async (args, { message }) => {
                    return args[0];
                },
            }],
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tekst>");
        const image = await fetch("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + args.join(" ")).then(res => res.buffer());

        const attachment = new MessageAttachment(image, "qr.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://qr.png");
        message.reply(embed);

    }
};

