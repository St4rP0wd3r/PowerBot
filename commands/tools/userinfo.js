const BaseCommand = require("../../lib/structures/bot/Command");
const moment = require("moment");
moment.locale("PL");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "userinfo",
            aliases: ["ui", "uzytkownik", "użytkownik", "gracz", "graczinfo", "whois", "ktoto"],
            description: "Pokazuje informacje o podanym użytkowniku.",
            usage: "<p>userinfo <Użytkownik>",
            category: "Narzędzia",
        });
    }

    async run(message, { args }) {
        const target = await client.functions.getUser(message, args[0]) || message.author;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        const userData = await client.database.users.get(target.id);

        const embed = new client.Embed(message)
            .setDescription("<:check_green:814098229712781313> **Informacje o użytkowniku**")
            .setThumbnail(target.displayAvatarURL(ImageURLOptions))
            .addField("Nick", `${target.tag} ${target.nickname ? `(*${target.nickname}*)` : ""} ${userData.badges.join(" ")}`)
            .addField("ID", `${target.id}`)
            .addField("Bot?", `${target.bot ? "Tak." : "Nie."}`)
            .addField("Utworzenie konta", `${moment(target.createdTimestamp).format("LLLL")}\n**(${moment(target.createdAt).fromNow()})**`);
        if (member) {
            embed
                .addField("Dołączenie do serwera", `${moment(member.joinedAt).format("LLLL")}\n**(${moment(member.joinedAt).fromNow()})**`)
                .addField("Najwyższa rola", `${member.roles.highest ? `<@&${member.roles.highest.id}>` : "Brak"}`);
        }
        message.reply(embed);

    }
};

