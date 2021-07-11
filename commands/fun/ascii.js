const BaseCommand = require("../../lib/structures/bot/Command");
const figlet = require("figlet");
const { MessageAttachment } = require("discord.js-light");
const fs = require("fs");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "ascii",
            aliases: ["asci"],
            description: "Zamienia Twój tekst na format ASCII",
            usage: "<p>ascii <Tekst>",
            category: "Zabawa",
        });
    }

    async run(message, { args, flags, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<pytanie>");
        figlet(`${args.join("\n")}`, async (err, data) => {
            if (data.toString().length > 2047 || flags.has("txt") || flags.has("t")) {
                const path = `./cache/${Math.randomInt(1, 999999)}_ascii_${message.author.id}.txt`;

                await fs.writeFileSync(path, data.toString());
                const embed = new client.Embed(message)
                    .setDescription("<:check_green:814098229712781313> Ascii\n\nTekst znajduje sie w pliku");
                await message.reply(null, { embed: embed, files: [new MessageAttachment(path, "ascii.txt")] });
                fs.unlinkSync(path);
            } else sender.create(`\`\`\`yaml\n${data}\`\`\``);
        });
    }
};

