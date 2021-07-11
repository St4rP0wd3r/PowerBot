const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");

const fetch = require("node-fetch");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "mc",
            description: "Pokazuje informacje o danym serwerze minecraft",
            usage: "<p>mc <server/user> <ip/nazwa>",
            category: "Zabawa",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        switch (args[0]) {
            case "server": {
                message.channel.startTyping(1);
                const server = await fetch(`https://api.mcsrvstat.us/2/${args[1]}`).then(response => response.json());
                message.channel.stopTyping(1);
                const attachment = new MessageAttachment(`http://status.mclive.eu/${args[1]}/${args[1]}/25565/banner.png`, "mc.png");
                if (!server.ip || !server.motd) return sender.argsError(this.help.usage, prefix, "<ip>", "Nie znaleziono serwera z takim IP");

                let motd = "Brak";
                if (server.motd.clean) {
                    motd = "";
                    for (const r of server.motd.clean) motd += `${r.trim()}\n`;
                }
                const embed = new client.Embed(message)
                    .attachFiles(attachment)
                    .setImage(`attachment://mc.png`)
                    .addField(`Serwer online`, `${server.online ? "Tak" : "Nie"}`)
                    .addField(`Animowane motd`, `${server.debug.animatedmotd ? "Tak" : "Nie"}`)
                    .addField(`Gracze`, `${server.players.online} z ${server.players.max}`)
                    .addField(`Motd`, `\`\`\`${motd}\`\`\``)
                    .addField(`Wersja gry`, `\`${server.version}\``)
                    .addField("IP", `\`${server.ip}:${server.port}\``)
                    .addField("Nazwa hosta", `\`${server.hostname}\``);
                return message.reply(embed);
            }
            case "user": {
                const user = await fetch(`https://api.ashcon.app/mojang/v2/user/${args[1]}`).then(res => res.json());
                if (user.code === 404 || !user.username) return sender.argsError(this.help.usage, prefix, "<nazwa>", "Nie znaleziono użytkownika z takim nickiem.");
                let usernames = "Brak";
                if (user.username_history) {
                    usernames = "";
                    for (const r of user.username_history) usernames += `${r.username}\n`;
                }
                const attachment = new MessageAttachment(`https://minotar.net/avatar/${user.username}`, "head.png");
                const embed = new client.Embed(message)
                    .addField("UUID", `\`${user.uuid}\``)
                    .addField("Aktualny nick", `\`${user.username}\``)
                    .addField("Historia nicków", `\`\`\`yaml\n${usernames}\`\`\``)
                    .addField("Data stworzenia konta", `\`${user.created_at || "Brak"}\``)
                    .addField("Własny skin", user.textures.custom ? "Tak" : "Nie")
                    .addField("Skin", `[klik](${user.textures.skin.url})`)
                    .setThumbnail("attachment://head.png")
                    .attachFiles(attachment);
                message.reply(embed);
                break;
            }
            default:
                return sender.argsError(this.help.usage, prefix, "<server/user>");
        }
    }
};

