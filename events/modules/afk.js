const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "afk",
        });
    }

    async run(message) {
        if (message.author.userData.afk.status) {
            message.reply(new client.Embed(message).setDescription("Nie jesteś już AFK")).then(x => x.delete({ timeout: 5000 }));
            message.author.userData.update({
                afk: {
                    status: false,
                    reason: null,
                },
            });
        }

        const mention = message.mentions.users.first();
        if (!mention) return;
        mention.fetch();
        const userdata = await client.database.users.get(mention.id);

        if (userdata.afk.status) message.reply(new client.Embed(message).setDescription(`Ta osoba jest AFK!\nPowód: ${userdata.afk.reason}`)).then(x => x.delete({ timeout: 5000 }));
    }
};