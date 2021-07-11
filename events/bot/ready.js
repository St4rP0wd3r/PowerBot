const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "ready",
            discord: "ready",
            once: true,
        });
    }

    async run() {
        console.log(client.user.tag + " is ready!");
        client.user.setPresence({
            status: "dnd",
            activity: { type: "WATCHING", name: "@Delover" },
        });
        client.config.perms.developer.forEach(x => client.users.fetch(x).catch(() => null));
        const embed = new client.Embed()
            .setColor("GREEN")
            .addField("Client", `${client.user} (\`${client.user.tag}\`)`)
            .setAuthor("Ready!", client.user.displayAvatarURL())
            .toJSON();
        if (client.config.settings.node === "production") client.functions.postJsonToApi(client.config.webhooks.ready, { embeds: [embed] });
    }
};
