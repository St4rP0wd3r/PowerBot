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
const getRandom = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "slut",
            aliases: ["prostytutka"],
            description: "Puszczasz sie za kase",
            usage: "<p>slut",
            category: "Ekonomia",
            disabled: true,
        });
    }

    async run(message) {
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
                    slut: 0,
                    crime: 0,
                    hazard: 0,
                },
            }).run(client.database.conn);
            user = (await r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).coerceTo("array").run(client.database.conn))[0];
        }

        const settings = await client.database.servers.get(message.guild.id);

        if (user.cooldown.slut > Date.now()) {
            return sender.error("||Dupa cie jeszcze boli!|| Odczekaj `" + timing(user.cooldown.slut - Date.now()) + "` zanim udasz się do klubu.");
        }

        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({ cooldown: { slut: Date.now() + settings.economy.cooldown.slut } }).run(client.database.conn);

        const random = getRandom(15, 100) >= 50;

        if (!random) {
            const moneySub = Math.floor(Math.random() * (settings.economy.multiplier / 3)) + 1;
            r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({ money: user.money - moneySub }).run(client.database.conn);
            return sender.error(settings.economy.replies.slut.fail[Math.floor(Math.random() * settings.economy.replies.slut.fail.length)].replace(/{cash}/g, moneySub + settings.economy.vault));
        }

        const moneyAdd = Math.floor(Math.random() * settings.economy.multiplier) + 1;

        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({ money: user.money + moneyAdd }).run(client.database.conn);


        sender.create(settings.economy.replies.slut.success[Math.floor(Math.random() * settings.economy.replies.slut.success.length)].replace(/{cash}/g, moneyAdd + settings.economy.vault));
    }
};

