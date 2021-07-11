const BaseCommand = require("../../lib/structures/bot/Command");
const r = require("rethinkdb");

const timing = (x) => {
    x = x / 1000;
    const d = Math.floor(x / 86400);
    x %= 86400;
    const h = Math.floor(x / 3600);
    x %= 3600;
    const m = Math.floor(x / 60);
    const s = Math.floor(x % 60);
    let y = [];
    if (d) y.push(d + " " + (d < 2 ? "dzień" : "dni"));
    if (h) y.push(h + " " + (h < 2 ? "godzina" : (h > 1 && h <= 4 ? "godziny" : "godzin")));
    if (m) y.push(m + " " + (m < 2 ? "minuta" : (m > 1 && m <= 4 ? "minuty" : "minut")));
    if (s) y.push(s + " " + (s < 2 ? "sekunda" : (s > 1 && s <= 4 ? "sekundy" : "sekund")));
    return y.join(", ");
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "work",
            aliases: ["pracuj", "robota"],
            description: "Pracuje aby zarobić",
            usage: "<p>work",
            category: "Ekonomia",
            disabled: true,
        });
    }

    async run(message, { args }) {
        const sender = new client.Sender(message);

        let user = (await r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).coerceTo("array").run(client.database.conn))[0];
        if (!user) {
            await r.table("Economy").insert({
                guildid: message.guild.id,
                userid: message.author.id,
                bank: 0,
                money: 0,
                cooldown: {
                    work: 0,
                    crime: 0,
                    slut: 0,
                    hazard: 0,
                },
            }).run(client.database.conn);
            user = (await r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).coerceTo("array").run(client.database.conn))[0];
        }

        const settings = await client.database.servers.get(message.guild.id);

        if (user.cooldown.work > Date.now()) return sender.error("Odczekaj `" + timing(user.cooldown.work - Date.now()) + "` przed ponownym pójściem do pracy.");

        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({ cooldown: { work: Date.now() + settings.economy.cooldown.work } }).run(client.database.conn);

        const money = Math.floor(Math.random() * settings.economy.multiplier) + 1;

        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({ money: user.money + money }).run(client.database.conn);

        sender.create(settings.economy.replies.work[Math.floor(Math.random() * settings.economy.replies.work.length)].replace(/{cash}/g, money + settings.economy.vault));
    }
};

