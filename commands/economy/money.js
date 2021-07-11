const BaseCommand = require("../../lib/structures/bot/Command");
const r = require("rethinkdb");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "money",
            aliases: ["portfel", "bank"],
            description: "Pokazuje stan konta oznaczonej osoby.",
            usage: "<p>money [@User]",
            category: "Ekonomia",
            disabled: true,
        });
    }

    async run(message, { args }) {
        const member = await client.functions.getUser(message, args) || message.member;

        let user = (await r.table("Economy").getAll([message.guild.id, member.id], { index: "getAll" }).coerceTo("array").run(client.database.conn))[0];
        if (!user) {
            await r.table("Economy").insert({
                guildid: message.guild.id,
                userid: member.id,
                bank: 0,
                money: 0,
                cooldown: {
                    work: 0,
                    crime: 0,
                    slut: 0,
                    hazard: 0,
                },
            }).run(client.database.conn);
            user = (await r.table("Economy").getAll([message.guild.id, member.id], { index: "getAll" }).coerceTo("array").run(client.database.conn))[0];
        }
        const settings = await client.database.servers.get(message.guild.id);

        message.reply(new client.Embed(message)
            .setAuthor(member.user.tag, member.user.displayAvatarURL(ImageURLOptions))
            .addField(`**» Portfel**`, `${user.money} ${settings.economy.vault}`)
            .addField(`**» Bank**`, `${user.bank} ${settings.economy.vault}`)
            .addField(`**» Łącznie**`, `${parseInt(user.money + user.bank)} ${settings.economy.vault}`)
            .setFooter("Numer konta: `" + user.id + "`", message.guild.iconURL(ImageURLOptions)),
        );
    }
};

