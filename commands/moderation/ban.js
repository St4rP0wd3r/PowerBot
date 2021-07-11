const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "ban",
            aliases: ["banuj", "wypierdalaj", "wypierdol", "zdzbanuj", "b"],
            botPerms: ["BAN_MEMBERS", "SEND_MESSAGES", "VIEW_CHANNEL"],
            description: "Banuje użytkownika z serwera",
            usage: "<p>ban <Użytkownik> [Powód]",
            category: "Administracyjne",
            flags: "`--nodm` - Nie wysyła wiadomości do użytkownika\n`--m` - Ukrywa moderatora\n",
            permissionLevel: 3,
        });
    }

    async run(message, { args, prefix, flags }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.argsError(this.help.usage, prefix, "<Użytkownik>");
        const target = await client.functions.getUser(message, args[0]);
        if (!target) return sender.argsError(this.help.usage, prefix, "<Użytkownik>");
        if (target.id === message.author.id) return sender.argsError(this.help.usage, prefix, "<Użytkownik>", "Nie możesz zbanować sam siebie xD");
        if (target.id === message.guild.ownerID) return sender.argsError(this.help.usage, prefix, "<Użytkownik>", "Nie możesz zbanować założyciela serwera.");
        if (target.id === client.user.id) return sender.error("Ale.. dlaczego? 😣");

        let banned;
        const banList = await message.guild.fetchBans();
        banList.forEach(user => {
            if (user.user?.id === target.id) banned = true;
        });
        if (banned) return sender.error("Ten użytkownik ma już bana!");


        if (await message.guild.members.fetch(target.id).catch(() => null)) {
            const member = await message.guild.member(target);
            if (message.guild.ownerID !== message.author.id && message.member.roles.highest.position <= member.roles.highest.position) return sender.error("Nie mozesz zbanować osoby z wyższą, lub równą Tobie rolą.");
            if (!member.bannable) return sender.error("Nie posiadam uprawnień aby zbanować tą osobę. Prawdopodobnie posiada wyższą role odemnie.");
        }
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
            let hide = [];

            let reason = args.slice(1).join(" ");
            if (reason.length <= 0) reason = "Powód nie został podany.";
            if (reason.length > 512) return sender.error("Powód bana jest zbyt długi. Maksymalna ilośc znaków w powodzie to 512.");
            let mod = `${message.author.tag} (\`${message.author.id}\`)`;
            if (flags.has("m")) mod = "[Ukryto]";
            if (flags.has("m")) hide.push("mod");
            if (flags.has("nodm")) hide.push("nodm");

            const { caseid } = await client.database.punishments.create(message.guild.id, target.id, {
                moderator: message.author.id,
                date: { created: Date.now(), expires: null },
                reason: reason,
                hide: hide,
                type: "ban",
            });

            if (!hide.includes("nodm")) {
                await target.send(new client.Embed()
                    .setColor("RED")
                    .setTitle("BAN")
                    .addField("**Serwer:**", message.guild.name)
                    .addField("**Moderator:**", mod)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => null);
            }


            await message.guild.members.ban(target, { reason: `${message.author.tag}: ${reason}` })
                .catch(() => {
                    return sender.error("Wystąpił błąd w banowaniu tego użytkownika.");
                });

            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został pomyślnie zbanowany.`),
            );

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))

                .addField("**»** Użytkownik", `> ${target?.tag} (${target?.id})`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Banowanie użytkownika.")
                .setColor("RED")
                .addField("**»** Punishment", `> #${caseid}`);
            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

