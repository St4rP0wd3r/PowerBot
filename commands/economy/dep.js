const BaseCommand = require("../../lib/structures/bot/Command");
const r = require("rethinkdb");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "dep",
            aliases: ["deposit", "wplac", "wpłać"],
            description: "Wpłaca kase do banku.",
            usage: "<p>dep <Amount/All>",
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
        if (!amount || amount < 1) return sender.error("Podaj prawiłową kwotę, lub wpisz `all` aby wpłacić wszystko!");

        if (user.money < amount) return sender.error("Nie posiadasz tyle pieniędzy!");
        if (amount === "all") {
            r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({
                money: 0,
                bank: user.bank + user.money,
            }).run(client.database.conn);
            return sender.create("Pomyślnie wplacono `" + user.money + "` " + settings.economy.vault + " do banku.");
        }
        r.table("Economy").getAll([message.guild.id, message.author.id], { index: "getAll" }).update({
            money: parseInt(user.money - amount),
            bank: user.bank + amount,
        }).run(client.database.conn);
        return sender.create("Pomyślnie wpłacono `" + amount + "` " + settings.economy.vault);
    }
};

