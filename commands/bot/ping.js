const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "ping",
            aliases: ["pong", "latency"],
            description: "Ping command",
            usage: "<p>ping",
            category: "Bot",
        });
    }

    async run(message) {
        message.reply(new client.Embed(message)
            .setDescription(`🏓 **Ping**\n\`\`\`ini\n[SHARD #0] - ${client.ws.shards.array()[0]?.ping}ms\`\`\``),
        );
    }
};

