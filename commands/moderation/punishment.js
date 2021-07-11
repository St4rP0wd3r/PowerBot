const { MessageEmbed } = require("discord.js-light");

const BaseCommand = require("../../lib/structures/bot/Command");

const punishmentTypes = {
    ban: "BAN",
    warn: "WARN",
    kick: "KICK",
    tempmute: "TEMPMUTE",
    tempban: "TEMPBAN",
    mute: "MUTE",
    unmute: "UNMUTE",
    unban: "UNBAN",
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "punishment",
            aliases: ["punish", "case"],
            description: "Wyświetla punishment o podanym numerze.",
            usage: "<p>punishment <Numer>",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const number = args[0];

        if (!number || !parseInt(number)) return sender.error(`Nie poprawny argument \`<numer>\`\nNie podano numeru kary\n\nPoprawne użycie: \`${prefix}punishment <numer>\``);

        const punish = await client.database.punishments.get(message.guild.id, parseInt(number));
        if (!punish) return sender.error(`Nie poprawny argument \`<numer>\`\nNie znaleziono takiej kary\n\nPoprawne użycie: \`${prefix}punishment <numer>\``);
        let mod = await client.users.fetch(punish.moderatorid).catch(() => null) || {
            tag: "Nie znaleziono",
            id: "Nie znaleziono",
        };
        if (punish?.hide?.includes("mod")) mod = "[Ukryto]";
        else mod = mod.tag;
        const user = await client.users.fetch(punish.userid) || { tag: "Nie znaleziono", id: "Nie znaleziono" };
        const desc = `**Użytkownik**: ${user.tag} (\`${user.id}\`)\n**Moderator**: ${mod}\n**Powód**: \`${punish.reason}\`\n**Data nadania**: \`${new Date(punish.date?.created).toLocaleString()}\`${punish.date?.expires ? `\n**Data zakończenia**: \`${new Date(punish.date?.expires).toLocaleString()}\`` : ""}`;
        if (punish.deleted) return sender.error("Ten punishment jest usuniety");
        const embed = new client.Embed(message)
            .setDescription(desc);
        message.reply(embed);
    }
};

