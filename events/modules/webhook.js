const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "webhookInit",
        });
    }

    async run(guild, channel) {
        try {
            if (!guild.me.hasPermission("MANAGE_WEBHOOKS")) return guild.webhook = null;
            const allwebhooks = await guild.fetchWebhooks().catch(() => null);
            const webhook = await allwebhooks?.find(r => r?.name === `Delover Webhooks ${client.user.id}`);
            if (!webhook) {
                guild.webhook = await channel?.createWebhook(`Delover Webhooks ${client.user.id}`, {
                    avatar: "https://delover.pro/assets/client.png",
                    reason: "Potrzebny webhook do komend i systemów",
                });
            } else guild.webhook = webhook;

            guild.webhook.setChannel = async (channele) => {
                if (channel.id === guild.webhook.channelID) return guild.webhook;
                return await guild.webhook.edit({
                    channel: channele,
                });
            };

        } catch {
            guild.webhook = null;
        }
    }
};