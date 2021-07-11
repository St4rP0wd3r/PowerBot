const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class guildDelete extends BaseEvent {
    constructor() {
        super({
            name: "guildDelete",
            discord: "guildDelete",
        });
    }

    async run(guild) {
        const owner = await client.users.fetch(guild.ownerID).catch(() => null);

        const guildLog = new client.Embed()
            .setAuthor("Usunięcie bota", client.user?.displayAvatarURL())
            .setThumbnail(guild.iconURL(ImageURLOptions))
            .setColor("RED")
            .addField("Serwer", `${guild.name} - ${guild.id}`)
            .addField("Serwery bota", client.guilds.cache.size)
            .addField("Użytkownicy", guild.memberCount)
            .addField("Właściciel", `${owner.tag || "Nie znaleziono"} - ${owner.id || "Nie znaleziono"}`)
            .toJSON();
        if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.guilds, { embeds: [guildLog] });
    }
};