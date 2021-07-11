const BaseCommand = require("../lib/structures/slash-commands/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            data: {
                name: "ping",
                description: "Pokazuje ping bota",
            },
        });
    }

    async run(interaction) {
        const settings = await client.database.servers.get(interaction.guild_id);
        const author = await client.users.fetch(interaction.member.user.id);
        const embed = new client.Embed({ settings, author })
            .setDescription(`🏓 **Ping**\n\`\`\`ini\n[SHARD #0] - ${client.ws.shards.array()[0]?.ping}ms\`\`\``);
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: "",
                    embeds: [embed],
                },
            },
        });
    }
};