const BaseEvent = require("../../lib/structures/bot/Event");
const r = require("rethinkdb");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "reactionRoleMessageDelete",
            discord: "messageDelete",
        });
    }

    async run(message) {
        if (!message) return;
        if (message.partial) await message.fetch().catch(() => null);
        if (!message.guild) return;
        const guildConf = await client.database.servers.get(message.guild.id);
        const rrData = guildConf.reactionroles.filter(x => x.msgid === message.id);
        for (const db of rrData) guildConf.reactionroles.deleteOne(db);

        guildConf.update({
            reactionroles: guildConf.reactionroles,
        });
    }
};