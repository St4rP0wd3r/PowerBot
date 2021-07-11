const { MessageAttachment } = require("discord.js-light");

const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: `amongus`,
            fileName: `img/amongus.js`,
            aliases: ["among", "among-us"],
            description: `Tworzy obrazek z postacią among us`,
            usage: `<p>amongus <tak/nie> <nick>`,
            category: "Obrazki",
            args: [{
                name: "amongus",
                ifFail: "Musisz podać poprawny argument (`tak/nie`)",
                description: "Użytkownik",
                required: true,
                check: async (args) => ["tak", "nie"].includes(args[0]),
            },
                {
                    name: "nick",
                    ifFail: "Musisz podać poprawny nick",
                    description: "Nick",
                    required: true,
                    check: async (args) => (args[1]),
                }],
        });
    }

    async run(message, { args, prefix }) {

        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<tak/nie>");
        const nick = args.slice(1).join(" ");
        if (!nick) return sender.argsError(this.help.usage, prefix, "<nick>");
        if (nick.length > 15) return sender.argsError(this.help.usage, prefix, "<nick>", "Nick nie może być dłuższy niż 15 znaków.");
        let impostor = args[0];
        if (impostor !== "tak" && impostor !== "nie") return sender.argsError(this.help.usage, prefix, "<tak/nie>");
        impostor = impostor === "tak";
        const color = ["black", "blue", "brown", "cyan", "darkgreen", "lime", "orange", "pink", "purple", "red", "white", "yellow"].random();
        const image = `https://vacefron.nl/api/ejected?name=${encodeURIComponent(nick)}&imposter=${impostor}&crewmate=${color}`;

        const attachment = new MessageAttachment(image, "impostor.png");
        const embed = new client.Embed()
            .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL(ImageURLOptions)}`)
            .attachFiles(attachment)
            .setImage(`attachment://impostor.png`);
        message.reply(embed);
    }


};

