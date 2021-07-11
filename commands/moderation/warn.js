const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "warn",
            aliases: ["warning", "ostrzez", "ostrzeż", "w"],
            permissionLevel: 2,
            description: "Nadaje ostrzeżenie użytkownikowi",
            usage: "<p>warn <Użytkownik> [Powód]",
            category: "Administracyjne",
            flags: "`--nodm` - Nie wysyła wiadomości do użytkownika\n`--m` - Ukrywa moderatora",
        });
    }

    async run(message, { args, flags, prefix }) {
        const sender = new client.Sender(message);
        const target = await client.functions.getUser(message, args[0]);
        if (!target) return sender.error(`Niepoprawny argument \`<@Użytkownik>\`\nNie oznaczono użytkownika.\n\nPoprawne użycie: \`${prefix}warn <@Użytkownik> [Powód]\``);
        if (target.id === message.author.id) return sender.error("Nie możesz ostrzec sam siebie!\n~~samookaleczenie jest złe~~");
        if (target.id === message.guild.ownerID) return sender.error("Nie możesz ostrzec właściciela serwera.");
        if (!await message.guild.members.fetch(target.id).catch(() => null)) return sender.error("Tego użytkownika nie ma na tym serwerze");
        if (target.id === client.user.id) return sender.error("Ale.. dlaczego? 😣");
        const member = await message.guild.member(target);
        if (message.guild.ownerID !== message.author.id && message.member.roles.highest.position <= member.roles.highest.position) return sender.error(`Nie możesz ostrzec osoby z wyższą, lub równą Tobie rolą.`);

        let reason = args.slice(1).join(" ");
        if (reason && reason.length > 512) return sender.error("Twój powód jest za długi! Maksymalna długość to 512 znaków.");
        if (!reason) reason = "Nie został podany.";
        let mod = `${message.author.tag} (\`${message.author.id}\`)`;
        if (flags.has("m")) mod = "[Ukryto]";
        let hide = [];
        if (flags.has("nodm")) hide.push("nodm");
        if (flags.has("m")) hide.push("mod");

        let btnyID = Math.randomInt(1, 9999999999);
        let btnnID = Math.randomInt(1, 9999999999);

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

        const msg = await message.reply({
            embed: new client.Embed(message).setDescription(`Czy na pewno chcesz ostrzec ${target} (\`${target.tag}\`)?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano ostrzeżenie ${target} (\`${target.tag}\`)`));
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
                type: "warn",
            });

            let wys;
            if (!hide.includes("nodm")) {
                await target.send(new client.Embed()
                    .setColor("ORANGE")
                    .setTitle("Warn")
                    .addField("**Serwer:**", message.guild.name)
                    .addField("**Moderator:**", mod)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => wys = "<:check_red:814098202063405056> Nie dostarczono");
                if (!wys) wys = "<:check_green:814098229712781313> Dostarczono.";
            }

            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został pomyślnie ostrzeżony.`),
            );

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .addField("**»** Użytkownik", `> <@!${target.id}> (\`${target.tag}\`)`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Ostrzeżenie użytkownika.")
                .setColor("ORANGE")
                .addField("**»** Punishment", `> #${caseid}`);
            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

