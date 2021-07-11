const BaseEvent = require("../../lib/structures/bot/Event");
const { Collection } = require("discord.js-light");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "snipeEdit",
            discord: "messageUpdate",
        });
    }

    async run(message, newMessage) {
        if (message?.partial) await message.fetch().catch(() => null);
        if (newMessage?.partial) await newMessage.fetch().catch(() => null);
        if (!message?.guild || !message?.author || message?.author?.bot) return;
        if (!client.snipes.get(message.channel.id)) client.snipes.set(message.channel.id, new Collection());
        const guildConf = await client.database.servers.get(message.guild.id);
        if (!guildConf.snipe.status) return;
        const coll = client.snipes.get(message.channel.id);

        coll.set(`${message.id}-edit-${Math.random(1, 999999)}`, {
            author: message.author.id,
            oldContent: message.content,
            newContent: newMessage.content,
            guild: message.guild.id,
            type: "edit",
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