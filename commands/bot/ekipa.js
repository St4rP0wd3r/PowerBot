const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "ekipa",
            aliases: ["pokazmideveow", "ktoumniepracuje"],
            description: "Pokazuje ekipe bota",
            usage: "<p>ekipa",
            category: "Bot",
        });
    }

    async run(message) {
        const guild = client.guilds.cache.get("703156079890268180");
        await guild.members.fetch();
        const developers = await guild.roles.cache.get("851907877697224765").members;
        const admins = await guild.roles.cache.get("851907878108659793").members;

        const moderators = await guild.roles.cache.get("851907878972293131").members;
        const helpers = await guild.roles.cache.get("851907879958478848").members;

        const embed = new client.Embed(message)
            .addField("Developerzy", developers.map(x => `[\`${x.user?.tag}\`](https://discord.com/users/${x.user?.id})`).join("\n") || "Brak")
            .addField("Administratorzy", admins.map(x => `[\`${x.user?.tag}\`](https://discord.com/users/${x.user?.id})`).join("\n") || "Brak")
            .addField("Moderatorzy", moderators.map(x => `[\`${x.user?.tag}\`](https://discord.com/users/${x.user?.id})`).join("\n") || "Brak")
            .addField("Pomocnicy", helpers.map(x => `[\`${x.user?.tag}\`](https://discord.com/users/${x.user?.id})`).join("\n") || "Brak");

        message.reply(embed);
    }
};


