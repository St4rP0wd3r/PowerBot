const BaseEvent = require("../../lib/structures/bot/Event");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");
module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "guildCreate",
            discord: "guildCreate",
        });
    }

    async run(guild) {
        const guildConf = await client.database.servers.get(guild.id);

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: "BOT_ADD",
        }).catch(() => null);
        const member = fetchedLogs?.entries?.first()?.executor;

        const embed = new client.Embed()
            .setColor("GREEN")
            .setThumbnail(client.user.displayAvatarURL())
            .setAuthor(member?.tag, member?.displayAvatarURL(ImageURLOptions))
            .setDescription(`Witaj **${member?.username}**! Serdecznie dziękujemy za dodanie bota client. Poniżej znajdziesz kilka informacji, które przydadzą Ci się podczas korzystania z bota. Pozdro <3`)
            .addField("• Prefixy", `> ${guildConf.prefixes.join(" | ")}`, true)
            .addField("• Komenda pomocy", `> \`${guildConf.prefixes[0]}pomoc\``, true)
            .addField("• Potrzebujesz pomocy?", `> Dołącz na nasz **[serwer wsparcia](${client.config.links.support})**\n> Lub skontantuj się z administracją. Komenda: \`${guildConf.prefixes[0]}ekipa\``);
        await member?.send({
            embed: embed,
            components: new MessageActionRow({
                components: [new MessageComponent({
                    url: client.config.links.support,
                    label: "Serwer support",
                    style: 5,
                }), new MessageComponent({
                    url: `https://delover.pro/dashboard/${guild.id}`,
                    label: "Dashboard",
                    style: 5,
                })],
            }),
        }).catch(() => null);

        if (client.config.settings.node !== "production") return;
        const members = await guild.members.fetch({ cache: false }).catch(() => null);

        const owner = await client.users.fetch(guild.ownerID).catch(() => null);

        const guildLog = new client.Embed()
            .setAuthor("Dodanie bota", client.user?.displayAvatarURL())
            .setThumbnail(guild.iconURL(ImageURLOptions))
            .addField("Serwer", `${guild.name} - ${guild.id}`)
            .addField("Serwery bota", client.guilds.cache.size)
            .addField("Właściciel", `${owner.tag || "Brak"} - ${owner.id || "Not Found"}`)
            .addField("Permisje", guild.me?.permissions ? (guild.me.permissions.toArray().includes("ADMINISTRATOR") ? "Admin" : guild.me.permissions.toArray().join(", ")) : "Brak")
            .addField("Użytkownicy", members.filter((m) => !m.user.bot).size)
            .addField("Boty", members.filter((m) => m.user.bot).size);
        if (member) guildLog.addField("Osoba która dodała", `${member.tag} - ${member.id}`);

        client.functions.postWebhook(client.config.webhooks.guilds, { embeds: [guildLog.toJSON()] });
    }
};