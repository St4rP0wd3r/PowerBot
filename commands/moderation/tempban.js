const ms = require("../../lib/modules/Ms");
const moment = require("moment");
moment.locale("PL");
const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");
const { MessageEmbed } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "tempban",
            aliases: ["czasbanuj", "czaswypierdalaj", "czaswypierdol", "czaszdzbanuj", "tb"],
            permissionLevel: 3,
            botPerms: ["SEND_MESSAGES", "VIEW_CHANNEL", "BAN_MEMBERS"],
            description: "Banuje użytkownika z serwera na określony czas",
            usage: "<p>tempban <użytkownik> <czas> [Powód]",
            category: "Administracyjne",
            flags: "`--nodm` - Nie wysyła wiadomości do użytkownika\n`--m` - Ukrywa moderatora",
        });
    }

    async run(message, { args, prefix, flags }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.error(`Niepoprawny argument \`<@Użytkownik>\`\nNie oznaczono użytkownika.\n\nPoprawne użycie: \`${prefix}tempban <@Użytkownik> <czas> [Powód]\``);
        const target = await client.functions.getUser(message, args[0]);

        if (!target) return sender.error(`Nie znaleziono takiego użytkownika. Użyj komendy \`${prefix}fetch <ID>\` by wprowadzić takiego użytkownika do pamięci.`);
        if (target.id === message.author.id) return sender.error("Nie możesz sam siebie zbanować. ~~Samookaleczanie jest złe, napewno masz po co żyć.~~");
        if (target.id === message.guild.ownerID) return sender.error("Nie możesz zbanować właściciela serwera.");
        if (!await message.guild.members.fetch(target.id).catch(() => null)) return sender.error("Tego użytkownika nie ma na tym serwerze");
        if (message.guild.members.cache.get(target.id)) {
            const member = await message.guild.member(target);
            if (message.guild.ownerID !== message.author.id && message.member.roles.highest.position <= member.roles.highest.position) return sender.error(`Nie mozesz zbanować osoby z wyższą, lub równą Tobie rolą.`);
            if (!member.bannable) return sender.error("Nie posiadam uprawnień aby zbanować tą osobę. Prawdopodobnie posiada wyższą role odemnie.");
        }

        if (!args[1]) return sender.error(`Niepoprawny argument \`<czas>\`\nNie podano czasu\n\nPoprawne użycie: \`${prefix}ban <@Użytkownik> <czas> [Powód]\``);

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
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz zbanować ${target} (\`${target.tag}\`)?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano zbanowanie ${target} (\`${target.tag}\`)`));
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
                type: "tempban",
            });
            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został zbanowany. Kara zakończy się \`${moment(Date.now() + time).fromNow()}\`.`),
            );


            await target.send(new MessageEmbed()
                .setColor("RED")
                .setTitle("Tempban")
                .addField("**Serwer:**", message.guild.name)
                .addField("**Moderator:**", mod)
                .addField("**Powód:**", reason)
                .addField("**Punishment:**", "#" + caseid)
                .addField("Zakończy sie", `${moment(Date.now() + time).format("LLLL")} (\`${moment(Date.now() + time).fromNow()}\`)`)
                .addField("**Akcja:**", "Czasowe zbanowanie użytkownika (tempban)"),
            ).catch(() => wys = "<:check_red:814098202063405056> Nie dostarczono");
            if (!wys) wys = "<:check_green:814098229712781313> Dostarczono.";


            await message.guild.members.ban(target, { reason: `${message.author.tag}: ${reason}` })
                .catch(() => {
                    return sender.error("Wystąpił błąd w banowaniu tego użytkownika.");
                });

            await client.database.tempbans.add(message.guild.id, target.id, {
                date: {
                    created: Date.now(),
                    expires: Date.now() + time,
                },
                moderator: message.author.id,
                caseid: caseid,
            });

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .addField("**»** Moderator", `> <@!${target.id}> (\`${target.tag}\`)`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Tymczasowe banowanie użytkownika.")
                .addField("**»** Data zakończenia", `> ${new Date(Date.now() + time).toLocaleString()}`)
                .setColor("RED")
                .addField("**»** Punishment", `> #${caseid}`);
            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

