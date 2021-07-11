const BaseCommand = require("../../lib/structures/bot/Command");
const region = {
    "brazil": "Brazylia",
    "europe": "Europa",
    "eu-central": "Europa Centralna",
    "hongkong": "Hong Kong",
    "india": "India",
    "japan": "Japonia",
    "russia": "Rosja",
    "singapore": "Singapur",
    "southafrica": " Afryka Południowa",
    "sydney": "Sydney",
    "us-central": "U.S. Central",
    "us-east": "U.S. East",
    "us-south": "U.S. South",
    "us-west": "U.S. West",
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "serverinfo",
            aliases: ["si", "serveri", "server", "serwer", "serwerinfo"],
            description: "Pokazuje informacje o serwerze",
            usage: "<p>serverinfo",
            category: "Narzędzia",
        });
    }

    async run(message, { args }) {
        const guild = client.guilds.cache.get(args[0]) || message.guild;

        const owner = await client.users.fetch(guild.ownerID).catch(() => "Nie znaleziono");
        const members = await guild.members.fetch({ cache: false });

        const embed = new client.Embed(message)
            .setAuthor(message.author.tag, message.author.displayAvatarURL(ImageURLOptions))
            .setThumbnail(guild.iconURL(ImageURLOptions))
            .setDescription("<:check_green:814098229712781313> **Informacje o serwerze**")
            .addField("Nazwa serwera", `${guild.name}`)
            .addField("Własciciel serwera", `${owner}`)
            .addField("Region", `${region[guild.region]}`)
            .addField("Kanał AFK", guild.afkChannel ? guild.afkChannel.name : "Brak.")
            .addField("Użytkownicy", members.filter((m) => !m.user.bot).size)
            .addField("Boty", members.filter((m) => m.user.bot).size)
            .addField("Ilość kanałów", guild.channels.cache.size)
            .addField("Ilość ról:", `${guild.roles.cache.size}`)
            .addField("Ilość emoji:", `${guild.emojis.cache.size}`);
        message.reply(embed);

    }
};

