const { MessageEmbed } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const Eval = require("../../lib/apis/OpenEval");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");
const codeBlocks = {
    python3: "py",
    python2: "py",
    node: "js",
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "openeval",
            aliases: ["oe"],
            description: "Wykonuje ",
            usage: "<p>openeval <język> <kod>",
            category: "Narzędzia",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const ev = new Eval();
        const lang = args[0];
        if (lang === "list" || lang === "languages") {
            const versions = await ev.fetchLanguages();
            const langs = (ev.languages).chunk(5);
            const embeds = [];
            for (const langArr of langs) {
                const embed = new client.Embed(message)
                    .setDescription("<:check_green:814098229712781313> **Lista języków**");
                for (const lang of langArr) embed.addField(lang, `v${versions[lang]}`);
                embeds.push(embed);
            }


            new ReactionPageMenu({
                channel: message.channel,
                userID: message.author.id,
                pages: embeds,
                message,
            });
            return;
        }
        if (!lang) return sender.argsError(this.help.usage, prefix, "<język>");
        const input = args.slice(1).join(" ");
        if (!input) return sender.argsError(this.help.usage, prefix, "<kod>");
        if (input.length > 1000) return sender.argsError(this.help.usage, prefix, "<kod>", "Kod nie może być długszy niż 1000 znaków");

        const evaled = await ev.eval(lang, input);
        if (evaled.message?.includes("runtime is unknown")) return sender.argsError(this.help.usage, prefix, "<język>", `Podano niepoprawny lub nieobsługiwany język. Lista jezyków: \`${prefix}openeval languages\``);
        if (evaled.stderr) {
            const embed = new client.Embed(message)
                .setColor(message.guild.settings?.colors?.error)
                .setDescription(`<:check_red:814098202063405056> Błąd\n\nJęzyk: \`${evaled.language}\`\nWersja języka: \`${evaled.version}\`\nZwrot:\n\`\`\`${codeBlocks[evaled.language] || evaled.language}\n${evaled.stderr || "\"\""}\`\`\``);
            return message.reply(embed).catch(() => {
                return sender.error("Wystąpił błąd. Prawdopodbnie zwrot jest zbyt duży");
            });
        }
        const embed = new client.Embed(message)
            .setDescription(`<:check_green:814098229712781313> Eval\n\nJęzyk: \`${evaled.language}\`\nWersja języka: \`${evaled.version}\`\nZwrot:\n\`\`\`${codeBlocks[evaled.language] || evaled.language}\n${evaled.output || "\"\""}\`\`\``);
        return message.reply(embed).catch(() => {
            return sender.error("Wystąpił błąd. Prawdopodbnie zwrot jest zbyt duży");
        });
    }
};

