const moment = require("moment");
moment.locale("PL");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "stoper",
            aliases: ["10s", "5s", "2s"],
            fileName: "fun/stoper.js",
            desc: "Liczy czas klikniecia w reakcje",
            usage: "<p>stoper",
            category: "Zabawa",
        });
    }

    async run(message) {
        const emb = new client.Embed(message)
            .setDescription("<:check_green:814098229712781313> Kliknięto w: \`?.??s\`");
        const m = await message.reply(emb);
        await m.react("⏱").catch(() => null);
        const lastTime = m.createdTimestamp;

        const filter = (reaction, user) => ["⏱"].includes(reaction.emoji.name) && user.id === message.author.id;
        const collected = await m.awaitReactions(filter, { max: 1, time: 90000, errors: ["time"] }).catch(e => e);
        if (collected.size === 0) {
            const emd = new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313> Kliknięto w: \`${moment.duration(new Date().getTime() - lastTime, "milliseconds").asSeconds().toFixed(2)}s\``);
            return m.edit(emd);
        }
        const reaction = collected.first();
        if (reaction.emoji.name === "⏱") {
            const emd = new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313> Kliknięto w: \`${moment.duration(Date.now() - lastTime, "milliseconds").asSeconds().toFixed(2)}s\``);
            m.edit(emd);
        }
    }
};

