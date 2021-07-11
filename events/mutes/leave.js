const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "muteLeave",
            discord: "guildMemberAdd",
        });
    }

    async run(member) {
        await member.fetch().catch(() => null);

        if (await client.database.mutes.get(member.guild.id, member.id)) {
            const guildConf = await client.database.servers.get(member.guild.id);
            const muterole = guildConf.mutedRole;
            if (!muterole) return;
            const role = member.guild.roles.cache.get(muterole);
            if (!role) return;
            member.roles.add(role, { reason: `Użytkownik jest wyciszony. Odcisz go komendą ${guildConf.prefixes[0]}unmute <user>` }).catch(() => null);
        }
    }
};
