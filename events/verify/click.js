const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "verifyClick",
            discord: "clickButton",
        });
    }

    async run(btn) {
        const { guild } = btn;
        if (btn.id !== "verify") return;
        const guildConf = await client.database.servers.get(guild.id);
        if (!guildConf.verify?.status || !guildConf.verify.roles) return;
        const user = await guild.members.fetch(btn.clicker.id);

        user.roles.add(guildConf.verify.roles).catch(() => null);
    }
};
