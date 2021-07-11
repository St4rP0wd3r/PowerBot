const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageAttachment } = require("discord.js-light");
const fetch = require("node-fetch");
const ranks = {
    wlasciciel: "Właściciel",
    admin: "Administator",
    moderator: "Modrator",
    helper: "Pomocnik",
    budowniczy: "Budowniczy",
    partner: "Partner",
    mvp: "MVP",
    svip: "SVIP",
    vip: "VIP",
    default: "Gracz",
};
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kaczkoland",
            aliases: [],
            description: "",
            usage: "<p>kaczkoland [gracz]",
            category: "",
            flags: null,
            disabled: false,
            permissionLevel: 1,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);
        const json = await client.functions.getJsonFromApi("https://api.kaczkoland.pl/all");
        if (args[0]) {
            const user = json.find(x => x.username === args[0]);
            const attachment = new MessageAttachment(`https://minotar.net/avatar/${user.username}`, "head.png");
            if (!user) return sender.argsError("<p>kaczkoland <użytkownik>", prefix, "<użytkownik>");

            const embed = new client.Embed(message)
                .addField("Zabójstwa graczy", `\`${user.player_kills}\``)
                .addField("Zabójstwa mobów", `\`${user.mob_kills}\``)
                .addField("Śmierci", `\`${user.deaths}\``)
                .addField("Wykopane bloki", `\`${user.mined_blocks}\``)
                .addField("Postawione bloki", `\`${user.placed_blocks}\``)
                .addField("Scraftowane itemy", `\`${user.crafted_items}\``)
                .addField("Przebiegnięte kilometry", `\`${user.walked_cm / 100000}km\``)
                .addField("Stan konta", `\`${user.money}\``)
                .addField("Ranga", `${ranks[user.primary_rank] || "Gracz"} `)
                .setColor("GREEN")
                .attachFiles(attachment)
                .setThumbnail("attachment://head.png")
                .setFooter("Serwer: kaczkoland.pl");
            message.reply(embed);
        } else {
            message.channel.startTyping(1);
            const server = await fetch(`https://api.mcsrvstat.us/2/kaczkoland.pl`).then(response => response.json());
            message.channel.stopTyping(1);
            const attachment = new MessageAttachment(`http://status.mclive.eu/kaczkoland.pl/kaczkoland.pl/25565/banner.png`, "mc.png");
            if (!server.ip || !server.motd) return sender.argsError(this.help.usage, prefix, "<ip>", "Nie znaleziono serwera z takim IP");

            let motd = "Brak";
            if (server.motd.clean) {
                motd = "";
                for (const r of server.motd.clean) motd += `${r.trim()}\n`;
            }
            const embed = new client.Embed(message)
                .attachFiles(attachment)
                .setThumbnail("https://kaczkoland.pl/kaczkoland.jpg")
                .setImage(`attachment://mc.png`)
                .addField(`Serwer online`, `${server.online ? "Tak" : "Nie"}`)
                .addField(`Gracze`, `${server.players.online} z ${server.players.max}`)
                .addField(`Motd`, `\`\`\`${motd}\`\`\``)
                .addField(`Wersja gry`, `\`${server.version}\``);
            return message.reply(embed);
        }

    }
};