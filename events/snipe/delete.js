const BaseEvent = require("../../lib/structures/bot/Event");
const { Collection } = require("discord.js-light");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "snipeDelete",
            discord: "messageDelete",
        });
    }

    async run(message) {
        if (message?.partial) await message.fetch().catch(() => null);
        if (!message?.guild || !message?.author || message?.author?.bot) return;

        if (!client.snipes.get(message.channel.id)) client.snipes.set(message.channel.id, new Collection());
        const guildConf = await client.database.servers.get(message.guild.id);
        if (!guildConf.snipe.status) return;
        const coll = client.snipes.get(message.channel.id);

        coll.set(message.id, {
            author: message.author.id,
            oldContent: message.content,
            newContent: null,
            guild: message.guild.id,
            type: "delete",
            attachments: message.attachments.map(a => a.proxyURL),
            date: Date.now(),
            id: message.id,
            reference: message.reference,
        });
        if (coll.size > 30) {
            const last = coll.first();
            coll.delete(last.id);
        }
    }
};