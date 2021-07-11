const BaseEvent = require("../../lib/structures/bot/Event");


module.exports = class messageReactionRemoveEvent extends BaseEvent {
    constructor() {
        super({
            name: "reactionRoleRemove",
            discord: "messageReactionRemove",
        });
    }

    async run(reaction, user) {
        if (!reaction || !user) return;
        if (reaction.message.partial) await reaction.message.fetch().catch(() => null);
        if (reaction.partial) await reaction.fetch().catch(() => null);
        const message = reaction.message;
        if (!message.guild) return;
        const guildConf = await client.database.servers.get(message.guild.id);
        const rrData = guildConf.reactionroles.filter(x => x.msgid === message.id && (x.emoji === reaction.emoji.name || x.emoji === reaction.emoji.id));

        const guild = client.guilds.cache.get(reaction.message.guild.id);
        await user.fetch();
        const user2 = await guild.members.fetch(user.id).catch(() => null);
        if (!user2) return;
        for (const rr of rrData) user2.roles.remove(rr.roleid).catch(() => null);

    }
};