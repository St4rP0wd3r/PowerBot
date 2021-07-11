const BaseCommand = require("../../lib/structures/bot/Command");
const r = require("rethinkdb");
const os = require("os");
const moment = require("moment");
moment.locale("PL");
const osu = require("node-os-utils");
const { formatSizeUnits } = require("../../lib/functions");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "stats",
            aliases: ["staty", "statystyki", "botinfo"],
            description: "Pokazuje statystyki bota i bazy danych",
            usage: "<p>ping",
            category: "Bot",
        });
    }

    async run(message, { prefix, args }) {
        message.channel.startTyping();
        if (args[0] === "db") {
            const tables = await r.tableList().run(client.database.conn);
            if (args[1] && tables.includes(args[1])) {
                const tableInfo = await r.db("rethinkdb").table("stats").coerceTo("array").run(client.database.conn);
                const filtred = tableInfo.filter(x => x.db === "Delover" && x.table === args[1])[1];

                const embed = new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> **Statystyki bazy danych**\n\nTabela: \`${args[1]}\`\n\nOdczytywane dokumenty: \`${filtred.query_engine.read_docs_total}\`\nZapisywane dokumenty: \`${filtred.query_engine.written_docs_total}\`\nIlość dokumentów: \`${(await r.table(args[1]).coerceTo("array").run(client.database.conn)).length}\`\nZajmowane miejsce na dysku: \`${formatSizeUnits(filtred.storage_engine.disk.space_usage.data_bytes)}\``);
                message.reply(embed);
                message.channel.stopTyping(1);
            } else {
                const embed = new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> **Informacje o bazie danych**\n\nIlość tabeli: \`${tables.length}\`\nLista tabeli: ${tables.map(x => `\`${x}\``).join(", ")}\n\nBy zobaczyć informacje o tabeli wpisz \`${prefix}stats db <tabela>\``);
                message.reply(embed);
                message.channel.stopTyping(1);
            }
        } else {
            let totalUsers = 0;
            client.guilds.cache.forEach(g => {
                totalUsers += g.memberCount;
            });
            const procent = await osu.cpu.usage();
            const embed = new client.Embed(message)
                .setDescription(`Aby zobaczyc statystyki bazy wpisz: \`${prefix}stats db\``)
                .addField("**»** Statystyki", `> **Serwery:** ${client.guilds.cache.size}\n> **Użytkownicy:** ${client.users.cache.size} (cache) ${totalUsers} (wszyscy)\n> **Shardy:** ${client.ws.shards.size}\n> **Kanały:** ${client.channels.cache.size}\n> **Kanały tekstowe:** ${client.channels.cache.filter((c) => c.type === "text").size}\n> **Kanały głosowe:** ${client.channels.cache.filter((c) => c.type === "voice").size}\n> **Kanały ogloszeniowe:** ${client.channels.cache.filter((c) => c.type === "news").size}\n> **Kanały sklepowe:** ${client.channels.cache.filter((c) => c.type === "store").size}\n> **Kategorie:** ${client.channels.cache.filter((c) => c.type === "category").size}`)
                .addField("**»** Zasoby", `> **Node.js:** ${process.version}\n> **Discord.js (light):** ${require("discord.js-light").version}\n> **Procesor:** ${os.cpus().map((i) => i.model)[0]}\n> **Zużycie CPU:** ${procent.toFixed(2)}%\n> **Zużycie RAM:** ${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)} MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB\n> **Uptime:** ${moment.duration(client.uptime).humanize()}`);
            // .addField("Node.js", `\`${process.version}\``)
            // .addField("Discord.js", `\`v${require("discord.js-light").version}\``)
            // .addField("Wersja bota", `\`${client.version}\``)
            // .addField("Użycie CPU", `\`${procent.toFixed(2)}%\``)
            // .addField("Użycie RAM", `\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)} MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB\``)
            // .addField("System", `\`${platforms[os.platform()]}\``)
            // .addField("Procesor", `\`${os.cpus().map((i) => i.model)[0]}\``)
            // .addField("Arch", `\`${os.arch()}\``)
            // .addField("Uptime", `\`${moment.duration(client.uptime).humanize()}\``)
            // .addField("Serwery", `\`${client.guilds.cache.size}\``)
            // .addField("Użytkownicy", `\`${client.users.cache.size}\``)
            // .addField("Shardy", `\`${client.ws.shards.size}\``)
            // .addField("Kanały", `\`${client.channels.cache.size}\``);
            message.reply(embed);
            message.channel.stopTyping(1);
        }
    }
};

