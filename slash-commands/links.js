const BaseCommand = require("../lib/structures/slash-commands/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            data: {
                name: "links",
                description: "Pokazuje linki zwiazane z botem",
            },
        });
    }

    async run(interaction) {
        const settings = await client.database.servers.get(interaction.guild_id);
        const author = await client.users.fetch(interaction.member.user.id);
        const embed = new client.Embed({ settings, author })
            .setDescription(`[Serwer Support](${client.config.links.support}) | [Strona](https://delover.pro) | [Dodanie bota](https://discord.com/api/oauth2/authorize?client_id=814064909313638450&permissions=347208&scope=bot%20applications.commands)`);
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