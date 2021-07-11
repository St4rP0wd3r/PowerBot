const { MessageEmbed } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow }
    = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "unmute",
            aliases: ["odwycisz", "um"],
            permissionLevel: 3,
            botPerms: ["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"],
            description: "Anuluje wyciszenie użytkownika",
            usage: "<p>unmute <Użytkownik>",
            category: "Administracyjne",
            flags: "`--nodm` - Nie wysyła wiadomości do użytkownika\n`--m` - Ukrywa moderatora",
        });
    }

    async run(message, { args, guildConf, prefix, flags }) {
        const sender = new client.Sender(message);
        const muteRole = message.guild.roles.cache.get(guildConf.mutedRole);

        if (!muteRole) return sender.error(`Nie znaleziono roli wyciszonych użytkowników. Ustaw ją w [panelu](https://delover.pro/dashboard/${message.guild.id})`);

        if (!args.length) return sender.error(`Niepoprawny argument \`<Użytkownik>\`\nNie oznaczono użytkownika.\n\nPoprawne użycie: \`${prefix}unmute <Użytkownik> [Powód]\``);
        const target = await client.functions.getUser(message, args[0]);
        if (!target) return sender.error(`Nie znaleziono takiego użytkownika.`);
        if (target.id === message.author.id) return sender.error("Nie możesz sam siebie odciszyć. ~~Nie możesz sam sobie pomóc~~");
        if (target.id === message.guild.ownerID) return sender.error("Nie możesz wyciszyć właściciela serwera.");
        if (!await message.guild.members.fetch(target.id).catch(() => null)) return sender.error("Tego użytkownika nie ma na tym serwerze");
        const member = await message.guild.member(target);
        if (!member.kickable) return sender.error("Nie posiadam uprawnień aby odciszyć tą osobę. Prawdopodobnie posiada wyższą role odemnie.");
        if (message.guild.ownerID !== message.author.id && message.member.roles.highest.position <= member.roles.highest.position) return sender.error(`Nie mozesz odciszyć osoby z wyższą, lub równą Tobie rolą.`);

        const userMuted = await client.database.mutes.get(message.guild.id, target.id);
        if (!userMuted) return sender.error(`Ten użytkownik nie jest wyciszony w naszej bazie danych.`);

        let hide = [];
        let reason = args.slice(1).join(" ");
        if (!reason) reason = "Powód nie został podany.";
        if (reason.length > 512) return sender.error("Powód bana jest zbyt długi. Maksymalna ilośc znaków w powodzie to 512.");
        let mod = `${message.author.tag} (\`${message.author.id}\`)`;
        if (flags.has("m")) mod = "[Ukryto]";
        let wys;
        if (flags.has("m")) hide.push("mod");
        const btnyID = Math.randomInt(1, 999999999999);
        const btnnID = Math.randomInt(1, 999999999999);

        const btny = new MessageComponent()
            .setID(btnyID)
            .setLabel("Tak")
            .setStyle(3)
            .setEmoji("848851089839095828");

        const btnn = new MessageComponent()
            .setID(btnnID)
            .setStyle(4)
            .setLabel("Nie")
            .setEmoji("848850859341250622");

        const btnlist = new MessageActionRow()
            .addComponents([btny, btnn]);

        const msg = await message.reply(null, {
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz odciszyć ${target} (\`${target.tag}\`)?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano odciszenie ${target} (\`${target.tag}\`)`));
                collector.stop();
            }
        });

        setTimeout(() => {
            collector.stop();
            msg.edit(msg.embeds[0]);
        }, 1000 * 60);

        async function done() {
            if (!flags.has("nobtn")) collector.stop();
            const { caseid } = await client.database.punishments.create(message.guild.id, target.id, {
                moderator: message.author.id,
                date: { created: Date.now(), expires: null },
                reason: reason,
                hide: hide,
                type: "unmute",
            });

            if (!hide.includes("nodm")) {
                await target.send(new client.Embed()
                    .setColor("GREEN")
                    .setTitle("Unmute")
                    .addField("**Serwer:**", message.guild.name)
                    .addField("**Moderator:**", mod)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => wys = "<:check_red:814098202063405056> Nie dostarczono");
                if (!wys) wys = "<:check_green:814098229712781313> Dostarczono.";
            }

            await member.roles.remove(muteRole, `${message.author.tag}: ${reason}`)
                .catch(() => {
                    return sender.error("Wystąpił błąd w wyciszaniu tego użytkownika.");
                });
            await userMuted.remove();

            const tempmute = await client.database.tempmutes.get(message.guild.id, target.id);
            if (tempmute) tempmute.remove();

            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został pomyślnie odciszony.`),
            );

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .addField("**»** Użytkownik", `> <@!${target.id}> (\`${target.tag}\`)`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Zakończenie wyciszenia użytkownika.")
                .setColor("GREEN")
                .addField("**»** Punishment", `> #${caseid}`);
            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

