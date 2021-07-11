const BaseCommand = require("../../lib/structures/bot/Command");
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "rr",
            aliases: ["reactionrole"],
            description: "Zarządza reactionrole",
            usage: "<p>rr",
            category: "",
            flags: null,
            disabled: false,
            permissionLevel: 1,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "create": {
                const link = args[1];
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);
                const emoji = args[2];
                if (!link) return sender.argsError("<p>rr create <link> <emoji> <rola>", prefix, "<link>");
                if (!emoji) return sender.argsError("<p>rr create <link> <emoji> <rola>", prefix, "<emoji>");
                if (!role) return sender.argsError("<p>rr create <link> <emoji> <rola>", prefix, "<rola>");

                const chid = link.split("/")[5];
                const msgid = link.split("/")[6];
                const ch = client.channels.cache.get(chid);
                if (!chid || !msgid) return sender.error("Podano niepoprawny link do wiadomości");
                if (!ch) return sender.warn(`Nie znaleziono takiej wiadomości`);
                const msg = await ch.messages.fetch(msgid);
                if (!msg) return sender.error("Nie znaleziono takiej wiadomości");

                if (guildConf.reactionroles.find(x => x.msgid === msg.id && x.emoji === emoji)) return sender.error("Taka emotka jest już przypisana");
                msg.react(emoji).catch(() => {
                    return sender.error("Nie moge dodac tej reakcji do wiadomości");
                }).then(() => {
                    guildConf.reactionroles.push({
                        channelid: ch.id,
                        msgid: msg.id,
                        emoji, roleid:
                        role.id,
                    });
                    guildConf.update({
                        reactionroles: guildConf.reactionroles,
                    });
                    sender.create(`Stworzono reaction role na kanale <#${ch.id}>`);
                });
                break;
            }

            case "remove": {
                const link = args[1];
                const emoji = args[2];
                if (!link) return sender.argsError("<p>rr remove <link> <emoji>", prefix, "<link>");
                if (!emoji) return sender.argsError("<p>rr remove <link> <emoji>", prefix, "<emoji>");
                const chid = link.split("/")[5];
                const msgid = link.split("/")[6];
                const ch = client.channels.cache.get(chid);
                if (!chid || !msgid) return sender.error("Podano niepoprawny link do wiadomości");
                if (!ch) return sender.error(`Nie znaleziono takiej wiadomości`);
                const msg = await ch.messages.fetch(msgid);
                if (!msg) return sender.error("Nie znaleziono takiej wiadomości");
                const rr = guildConf.reactionroles.find(x => x.msgid === msg.id && x.emoji === emoji);
                if (!rr) return sender.error("Nie znaleziono tgo rr");
                sender.create(`Usunieto reaction role na kanale <#${ch.id}>`);
                guildConf.reactionroles.deleteOne(rr);
                guildConf.update({
                    reactionroles: guildConf.reactionroles,
                });
                break;
            }

            default: {
                const embed = new client.Embed(message)
                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja reactionrole**")
                    .addField("Dodawanie reaction roli", `\`${prefix}rr create <link> <emoji> <rola>\``)
                    .addField("Usuwanie reaction roli", `\`${prefix}rr remove <link> <emoji>\``);
                return message.reply(embed);
            }
        }
    }
};