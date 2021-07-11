const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "links",
            aliases: ["invite", "support", "linki", "dodaj-bota", "botadd", "addbot", "add-bot", "dodaj", "zapro", "dodajtegowspanialegobota"],
            description: "Linki",
            usage: "<p>links",
            category: "Bot",
        });
    }

// [Serwer Support](${}) | [Strona]() | [Dodanie bota]()
    async run(message) {
        const embed = new client.Embed(message).setDescription(`[Serwer Support](${client.config.links.support}) | [Strona](https://delover.pro) | [Dodanie bota](https://discord.com/api/oauth2/authorize?client_id=814064909313638450&permissions=347208&scope=bot%20applications.commands)`);
        message.reply({
            embed,
            components: new MessageActionRow({
                components: [new MessageComponent({
                    url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=347208&scope=bot%20applications.commands`,
                    label: "Dodawanie bota",
                    style: 5,
                }), new MessageComponent({
                    url: "https://delover.pro",
                    label: "Strona bota",
                    style: 5,
                })],
            }),

        });
    }
};



