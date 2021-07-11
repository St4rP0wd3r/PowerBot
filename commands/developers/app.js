const fetch = require("node-fetch");
const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "app",
            permissionLevel: 6,
            description: "Pokazuje informacie o aplikacji",
            usage: "<p>app <id>",
            category: "Deweloperskie",
        });
    }

    async run(message, { args }) {
        const sender = new client.Sender(message);
        if (args[0]?.startsWith("<")) args[0] = client.functions.parseMention(args[0]);
        const body = await fetch(`https://discord.com/api/oauth2/authorize?client_id=${args[0] || client.user.id}&permissions=8&scope=bot%20identify%20guilds`, {
            headers: {
                Authorization: `ODQ2MzAxNTcyOTA3OTI1NTI0.YKtiKw.3Wlnrch8OdpkQTpAYTVP3anG3YY`,
            },
        }).then(x => x.json());
        if (body.hasOwnProperty("client_id") || body.code === 10002) return sender.error("Aplikacja nie znaleziona");
        const embed = new client.Embed(message)
            .setDescription("<:check_green:814098229712781313> **Info o aplikacji**")
            .setThumbnail(`https://cdn.discordapp.com/icons/${body.application.id}/${body.application.icon}`)
            .addField("Nazwa", `${body.application.name} - ${body.application.id}`)
            .addField("Opis", `${body.application.description || "None"}`)
            .addField("Links", `Polityka prywatności: ${body.application.privacy_policy_url || "Brak"}\nToS: ${body.application.terms_of_service_url || "Brak"}`)
            .addField("Publiczna", `${body.application.bot_public ? "Tak" : "Nie"}`)
            .addField("Serwery", `${body.bot.approximate_guild_count}`)
            .addField("Zaproszenie", `[\`Kliknij!\`](https://discord.com/api/oauth2/authorize?client_id=${body.application.id}&permissions=8)`);
        message.channel.send(embed);
    }

};

