const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageEmbed } = require("discord.js-light");
const { MessageComponent, MessageActionRow }
    = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "unban",
            aliases: ["odbanuj", "ub"],
            permissionLevel: 3,
            botPerms: ["SEND_MESSAGES", "VIEW_CHANNEL", "BAN_MEMBERS"],
            description: "Odbanowywuje użytkownika.",
            usage: "<p>unban <@Użytkownik> [Powód]",
            category: "Administracyjne",
            flags: "`--m` - Ukrywa moderatora",
        });
    }

    async run(message, { args, flags, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length) return sender.error(`Niepoprawny argument \`<Użytkownik>\`\nNie oznaczono użytkownika.\n\nPoprawne użycie: \`${prefix}unban <Użytkownik> [Powód]\``);
        const target = await client.functions.getUser(message, args[0]);
        if (!target) return sender.error(`Nie znaleziono takiego użytkownika. Użyj komendy \`${prefix}fetch <ID>\` by wprowadzić takiego użytkownika do pamięci.`);

        let banned;
        const banList = await message.guild.fetchBans();
        banList.forEach(user => {
            if (user.user?.id === target.id) banned = true;
        });
        if (!banned) return sender.error(`Ten użytkownik nie jest zbanowany na tym serwerze`);

        let reason = args.slice(1).join(" ");
        if (!reason) reason = "Nie został podany.";
        let hide = [];
        let wys;

        let mod = `${message.author.tag} (\`${message.author.id}\`)`;

        if (flags.has("m")) mod = "[Ukryto]";

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
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz odbanować ${target} (\`${target.tag}\`)?`),
            components: btnlist,

        });
        if (flags.has("nobtn")) return done();


        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano odbanowanie ${target} (\`${target.tag}\`)`));
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
                type: "unban",
            });

            if (!hide.includes("nodm")) {
                await target.send(new client.Embed()
                    .setColor("GREEN")
                    .setTitle("Unban")
                    .addField("**Serwer:**", message.guild.name)
                    .addField("**Moderator:**", mod)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => wys = "<:check_red:814098202063405056> Nie dostarczono");
                if (!wys) wys = "<:check_green:814098229712781313> Dostarczono.";
            }

            await message.guild.members.unban(target.id).catch(() => null);


            await msg.edit(new client.Embed(message)
                .setDescription(`<:check_green:814098229712781313>** \`Case #${caseid}\`** Użytkownik **<@${target.id}>** (\`${target.tag}\`) został pomyślnie odbanowany.`),
            );

            if (!message.guild.settings.modlog.status) return;
            const embed = new client.Embed()
                .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))

                .addField("**»** Użytkownik", `> <@!${target.id}> (\`${target.tag}\`)`)
                .addField("**»** Powód", "> " + reason)
                .addField("**»** Akcja", "> Odbanowanie użytkownika.")
                .setColor("GREEN")
                .addField("**»** Punishment", `> #${caseid}`);

            message.guild.channels.cache.get(message.guild.settings.modlog.channel)?.send(embed);
        }
    }
};

