const BaseEvent = require("../../lib/structures/bot/Event");
const { Collection, MessageAttachment } = require("discord.js-light");
const cooldowns = new Collection();
const permsList = {
    1: "1: Użytkownik",
    2: "2: Pomocnik",
    3: "3: Moderator",
    4: "4: Administator",
    5: "5: Właściciel serwera",
    6: "6: Programista",
};
const fs = require("fs");
const MessageFlagsParser = require("../../lib/structures/bot/MessageFlagsParser");
const { MessageActionRow, MessageComponent } = require("../../lib/structures/components");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "message",
            discord: "message",
        });
    }

    async run(message) {
        if (message.author.bot || !message.guild || !message.member || !message.guild.me.hasPermission(["SEND_MESSAGES", "READ_MESSAGE_HISTORY", "VIEW_CHANNEL"])) return;
        const guildConf = await client.database.servers.get(message.guild.id);
        message.guild.settings = guildConf;
        await client.events.get("webhookInit").run(message.guild, message.channel);
        const sender = new client.Sender(message);
        const prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
        guildConf.prefixes.forEach(x => prefixes.push(x));
        const prefix = prefixes.find(x => message.content.startsWith(x));
        const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`, "g");
        const perms = await client.functions.getUserPerms(message);
        message.member.perms = message.member.permissionLevel = perms;
        const user = message.author.userData = await client.database.users.get(message.author.id);
        await message.author.fetch();
        await client.events.get("afk").run(message);

        if (!prefix && guildConf.proposals.status && guildConf.proposals.channels.includes(message.channel.id)) await client.events.get("proposalCreate").run(message, { guildConf });
        if (guildConf.leveling.status) await client.events.get("leveling").run(message, { guildConf });
        const autoresponers = guildConf.autoresponders?.filter(x => x.msg.toLowerCase() === message.content.toLowerCase());
        if (autoresponers?.length) autoresponers?.forEach(ar => message.reply(ar.reply));

        if (message.content.match(prefixMention)) {
            if (user.gban && user.gban?.status) return message.reply(new client.Embed(message).setColor(message.guild.settings.colors.error).setDescription(`<:check_red:814098202063405056> **Zostałeś globalnie zbanowany!**\n \n:clipboard: **Powód:** ${user.gban.reason}\n:clock3: **Data:** ${new Date(user.gban.date).toLocaleString()}\n\nUważasz ze zostałeś niesłusznie zbanowany? Wejdź na [Serwer Support](${client.config.links.support})`));
            message.reply(new client.Embed(message)
                    .setDescription(`<a:waveAni:853664023467655168> Hej! Oznaczyłeś mnie.\n**Jestem Delover** - Twój bot multifunkcyjny\n \nWięcej informacji`)
                    .addField("» Prefixy", `> ${guildConf.prefixes.join(" | ")}`, true)
                    .addField("» Ping", "> " + message.guild.shard.ping, true)
                    .addField("» Serwery", "> " + client.guilds.cache.size, true),
                {
                    components: new MessageActionRow({
                        components: [new MessageComponent({
                            url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=347208&scope=bot%20applications.commands`,
                            label: "Dodaj bota",
                            style: 5,
                        }), new MessageComponent({
                            url: "https://delover.pro",
                            label: "Strona bota",
                            style: 5,
                        })],
                    }),
                },
            );
        }

        if (guildConf.antyinvite?.status && !message.member.roles.cache.some(x => guildConf.antyinvite.roles.includes(x.id)) && !guildConf.antyinvite.channels.includes(message.channel.id) && !guildConf.antyinvite.users.includes(message.author.id)) if (!await client.events.get("antyinviteInit").run(message)) return;

        if (!prefix) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(commandName));
        if (!command) return;

        message.flags = MessageFlagsParser.parseMessage(args);

        if (Array.isArray(command.botPerms) && !message.guild.me.hasPermission(command.botPerms)) return sender.error(`Bot nie posiada uprawnień do wykonania tej komendy. Wymagane: \`${command.botPerms.join(", ")}\``);
        if (command.conf.disabled && perms !== 6) return sender.error(`Komenda wyłączona! Nie możesz jej użyć`);
        if (perms < command.conf.permissionLevel) return sender.error(`Nie posiadasz uprawnień do użycia tej komendy.\n\nWymagane: **\`${permsList[command.conf.permissionLevel]}\`**\nPosiadane: **\`${permsList[perms]}\`**`);
        if (command.conf.premium && !message.author.userData.premium?.status) return sender.error(`Nie posiadasz premium! Wiecej informacji na [serwerze support](${client.config.links.support})`);
        if (command.conf.beta && !message.author.userData.premium?.status) return sender.error(`musisz posiadać premium żeby testować komendy beta! Wiecej informacji na [serwerze support](${client.config.links.support})`);

        if (perms !== 6) {
            if (!cooldowns.has(command.conf.name)) cooldowns.set(command.conf.name, new Collection());

            const timestamps = cooldowns.get(command.conf.name);
            const cooldownAmount = command.conf.cooldown * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (Date.now() < expirationTime) {
                    const timeLeft = (expirationTime - Date.now()) / 1000;
                    return sender.error(`Poczekaj \`${timeLeft.toFixed(1)}s\` przed wykonaniem tej komendy`);
                }
            }

            timestamps.set(message.author.id, Date.now());
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        if (command.conf.args?.length) {
            for (const arg of command.conf.args) if (!await arg.check(args, { message })) return sender.error(`Nieprawidłowy argument \`${arg.required ? `<${arg.name}>` : `[${arg.name}]`}\`.\n${arg.ifFail}\n\nPoprawne użycie: \`${command.help.usage.replace("<p>", prefix)}\``);
        }


        await command.run(message, {
            args,
            flags: message.flags,
            prefix: prefix.includes(client.user.id) ? "<wzmianka>" : prefix,
            guildConf,
        }).catch(error => client.functions.errors.hadleCommandError(message, error, command));
    }
};
