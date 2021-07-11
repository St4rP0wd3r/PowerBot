const BaseCommand = require("../../lib/structures/bot/Command");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");
const moment = require("moment");
moment.locale("PL");
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
const permsList = {
    1: "1: Użytkownik",
    2: "2: Pomocnik",
    3: "3: Moderator",
    4: "4: Administator",
    5: "5: Właściciel serwera",
    6: "6: Programista",
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "punishments",
            aliases: ["bans", "warns", "kicks", "history"],
            description: "Wyswietla wszystkie punishmenty danego użytkownika.",
            usage: "<p>punishments <użytkownik>",
            category: "Administracyjne",
            args: [{
                name: "użytkownik",
                ifFail: "Musisz podać poprawnego użytkownika",
                description: "Użytkownik",
                required: false,
                check: async (args, { message }) => {
                    if (!args[0]) return true;
                    return await client.functions.getUser(message, args[0]);
                },
            }],
        });
    }

    async run(message, { args }) {
        const sender = new client.Sender(message);
        const target = await client.functions.getUser(message, args[0]) || message.author;
        if (target.id !== message.author.id && message.member.permissionLevel <= 1) return sender.error(`Nie posiadasz uprawnień do sprawdzania kar innych użytowników.\nWymagane uprawnienia: \`2: Moderator\`\nTwoje uprawnienia: \`${permsList[message.member.permissionLevel]}\``);
        const punishments = await client.database.punishments.history(message.guild.id, target.id);

        const formatedPunishments = punishments.filter(x => !x.deleted);

        if (!formatedPunishments.length) return sender.error(`Użytkownik ${target.username} nie posiada punishmentów.`);

        const warns = formatedPunishments.filter(x => x.type === "warn").length;
        const bans = formatedPunishments.filter(x => x.type === "ban").length;
        const kicks = formatedPunishments.filter(x => x.type === "kick").length;
        const mutes = formatedPunishments.filter(x => x.type === "mute").length;
        const tempmutes = formatedPunishments.filter(x => x.type === "tempmute").length;
        const tempbans = formatedPunishments.filter(x => x.type === "ban").length;
        const unmutes = formatedPunishments.filter(x => x.type === "unmute").length;
        const unbans = formatedPunishments.filter(x => x.type === "unban").length;

        const userPunishments = formatedPunishments.reverse().chunk(5);
        const defaultEmbed = new client.Embed(message)
            .setDescription(`<:check_green:814098229712781313> Użytkownik: ${target}`)
            .addField("Kary", `Ilość warnów: \`${warns}\`\nIlość banów: \`${bans}\`\nIlość kicków: \`${kicks}\`\nIlość wyciszeń: \`${mutes}\`\nIlość czasowych wyciszeń: \`${tempmutes}\`\nIlość czasowych banów\`${tempbans}\n\`Ilość unbanów: \`${unbans}\`\nIlość odciszeń: \`${unmutes}\``)
            .setFooter("Przewiń strzałkami by podejrzeć kary")
            .setColor(message.guild.settings?.colors?.done);
        const embeds = [defaultEmbed];
        for (const arr of userPunishments) {
            const embed = new client.Embed(message)
                .setTitle("<:check_green:814098229712781313> Kary")
                .setColor(message.guild.settings?.colors?.done);
            for (const punish of arr) {
                let mod = await client.users.fetch(punish.moderatorid).catch(() => null) || {
                    tag: "Nie znaleziono",
                    id: "Nie znaleziono",
                };
                if (punish?.hide?.includes("mod")) mod = "[Ukryto]";
                else mod = mod.tag;
                const desc = `**Moderator**: ${mod}\n**Powód**: \`${punish.reason}\`\n**Data nadania**: \`${new Date(punish.date?.created).toLocaleString()}\`${punish.date?.expires ? `\n**Data zakończenia**: \`${new Date(punish.date?.expires).toLocaleString()}\`` : ""}`;
                const title = `**[\`${punishmentTypes[punish.type]}\`]** Punishment #${punish.caseid}`;
                embed.addField(title, desc);
            }
            embeds.push(embed);

        }
        new ReactionPageMenu({
            channel: message.channel,
            pages: embeds,
            userID: message.author.id,
            message: message,
        });
    }
};

