const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow }
    = require("../../lib/structures/components");
const { MessageEmbed } = require("discord.js-light");

const ms = require("../../lib/modules/Ms");
const moment = require("moment");
moment.locale("PL");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "tempmute",
            aliases: ["czasmorda", "czascicho", "tm"],
            permissionLevel: 3,
            botPerms: ["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"],
            description: "Wycisza użytkownika z serwera na określony czas",
            usage: "<p>tempmute <użytkownik> <czas> [Powód]",
            category: "Administracyjne",
            flags: "`--nodm` - Nie wysyła wiadomości do użytkownika\n`--m` - Ukrywa moderatora",
        });
    }

    async run(message, { args, guildConf, prefix, flags }) {
        const sender = new client.Sender(message);

        const muteRole = message.guild.roles.cache.get(guildConf.mutedRole);

        if (!muteRole) return sender.error(`Nie znaleziono roli wyciszonych użytkowników. Ustaw ją w [panelu](https://delover.pro/dashboard/${message.guild.id})`);

        if (!args.length) return sender.error(`Niepoprawny argument \`<@Użytkownik>\`\nNie oznaczono użytkownika.\n\nPoprawne użycie: \`${prefix}tempmute <@Użytkownik> <czas> [Powód]\``);
        const target = await client.functions.getUser(message, args[0]);

        if (!target) return sender.error(`Nie znaleziono takiego użytkownika. Użyj komendy \`${prefix}fetch <ID>\` by wprowadzić takiego użytkownika do pamięci.`);
        if (target.id === message.author.id) return sender.error("Nie możesz sam siebie zbanować. ~~Samookaleczanie jest złe, napewno masz po co żyć.~~");
        if (target.id === message.guild.ownerID) return sender.error("Nie możesz zbanować właściciela serwera.");
        if (!await message.guild.members.fetch(target.id).catch(() => null)) return sender.error("Tego użytkownika nie ma na tym serwerze");
        const member = await message.guild.member(target);

        if (message.guild.ownerID !== message.author.id && message.member.roles.highest.position <= member.roles.highest.position) return sender.error(`Nie mozesz wyciszyć osoby z wyższą, lub równą Tobie rolą.`);
        if (!member.kickable) return sender.error("Nie posiadam uprawnień aby wyciszyć tą osobę. Prawdopodobnie posiada wyższą role odemnie.");
        if (target.id === client.user.id) return sender.error("Ale.. dlaczego? 😣");

        if (!args[1]) return sender.error(`Niepoprawny argument \`<czas>\`\nNie podano czasu\n\nPoprawne użycie: \`${prefix}ban <@Użytkownik> <czas> [Powód]\``);

        const userMuted = await client.database.mutes.get(message.guild.id, target.id);
        if (userMuted) return sender.error(`Ten użytkownik jest wyciszony w naszej bazie danych. Odcisz go komendą \`${prefix}unmute\``);

        let time = ms(args[1]);
        if (!time) return sender.error(`Niepoprawny argument \`<czas>\`\nPodano zły czas\n\nPoprawne użycie: \`${prefix}ban <@Użytkownik> <czas> [Powód]\``);
        let reason = args.slice(2).join(" ");
        if (reason.length <= 0) reason = "Powód nie został podany.";
        if (reason.length > 512) return sender.error("Powód bana jest zbyt długi. Maksymalna ilośc znaków w powodzie to 512.");
        let mod = `${message.author.tag} (\`${message.author.id}\`)`;
        if (flags.has("m")) mod = "[Ukryto]";
        let wys;
        let hide = [];
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
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz wyciszyc ${target} (\`${target.tag}\`)?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano wyciszenie ${target} (\`${target.tag}\`)`));
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
                date: { created: Date.now(), expires: Date.now() + time },
                reason: reason,
                hide: hide,
                type: "warn",
            });

            if (!hide.includes("nodm")) {
                await target.send(new client.Embed()
                    .setColor("RED")
                    .setTitle("Tempmute")
                    .addField("**Serwer:**", message.guild.name)
                    .addField("**Moderator:**", mod)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid)
                    .addField("Zakończy sie", `${moment(Date.now() + time).format("LLLL")} (\`${moment(Date.now() + time).fromNow()}\`)`),
                ).catch(() => wys = "<:check_red:814098202063405056> Nie dostarczono");
                if (!wys) wys = "<:check_green:814098229712781313> Dostarczono.";
            }

            await member.roles.add(muteRole, `${message.author.tag}: ${reason}`)
                .catch(() => {
                    return sender.error("Wystąpił błąd w wyciszaniu tego użytkownika.");
                });

            await client.database.tempmutes.add(message.guild.id, target.id, {
                date: {
                    created: Date.now(),
                    expires: Date.now() + time,
                },
                moderator: message.author.id,
                caseid: caseid,
            });

            client.database.mutes.add(message.guild.id, target.id);

            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został wyciszony. Kara zakończy się \`${moment(Date.now() + time).fromNow()}\`.`),
            );

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))

                .addField("**»** Użytkownik", `> <@!${target.id}> (\`${target.tag}\`)`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Tymczasowe wyciszanie użytkownika.")
                .addField("**»** Data zakończenia", `> ${new Date(Date.now() + time).toLocaleString()}`)
                .setColor("RED")
                .addField("**»** Punishment", `> #${caseid}`);
            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

