const BaseCommand = require("../../lib/structures/bot/Command");
const r = require("rethinkdb");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "with",
            aliases: ["withdraw", "wyplac", "wypłać"],
            description: "Wypłaca kase z bankomatu.",
            usage: "<p>with <Amount/All>",
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

        let amount = args[0]?.toLowerCase() === "all" ? "all" : parseInt(args[0]);
        if (!amount || amount < 1) return sender.error("Podaj prawiłową kwotę, lub wpisz `all` aby wypłacić wszystko!");

        if (user.bank < amount) return sender.error("Nie posiadasz tyle pieniędzy!");
        if (amount === "all") {
            r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({
                money: user.money + user.bank,
                bank: 0,
            }).run(client.database.conn);
            return sender.create("Pomyślnie wypłacono `" + user.bank + "` " + settings.economy.vault + ".");
        }
        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({
            money: parseInt(user.money + amount),
            bank: parseInt(user.bank - amount),
        }).run(client.database.conn);
        return sender.create("Pomyślnie wypłacono `" + amount + "` " + settings.economy.vault);
    }
};

