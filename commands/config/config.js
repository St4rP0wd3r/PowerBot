const BaseCommand = require("../../lib/structures/bot/Command");
const obj = {
    on: true,
    off: false,
};
const ReactionMenu = require("../../lib/structures/bot/ReactionPageMenu");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "config",
            aliases: ["conf"],
            permissionLevel: 4,
            description: "Zarządza konfiguracja serwera",
            usage: "<p>config",
            category: "Konfiguracyjne",
        });
    }

    async run(message, { args, guildConf, prefix }) {
        const sender = new client.Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "ar":
            case "autoresponders": {
                switch (args[1]) {
                    case "add": {
                        const msg = args.slice(2).join(" ").split(";")[0];
                        const repl = args.slice(2).join(" ").split(";")[1];
                        if (!msg) return sender.argsError("<p>autoresponder add <wiadomość>;<odpowiedź>", prefix, "<wiadomość>");
                        if (!repl) return sender.argsError("<p>autoresponder add <wiadomość>;<odpowiedź>", prefix, "<wiadomość>");
                        if (guildConf.autoresponders.find(x => x.msg.toLowerCase() === msg.trim().toLowerCase())) return sender.argsError("<p>autoresponder add <msg>;<reply></reply>", prefix, "<id>", "Autoresponder o tej wiadomości już istnieje");
                        const arid = guildConf.autoresponders.length + 1;
                        guildConf.autoresponders.push({
                            id: arid,
                            msg: msg,
                            reply: repl,
                        });

                        await guildConf.update({
                            autoresponders: guildConf.autoresponders,
                        });
                        sender.create(`Wiadomość na która reaguje: ${msg}\nWiadomość którą odpowiada: ${repl}\nID: \`${arid}\``);
                        return;
                    }
                    case "remove": {
                        const id = args[2];
                        if (!id || !parseInt(id)) return sender.argsError("<p>autoresponder remove <id>", prefix, "<id>");
                        const ar = guildConf.autoresponders?.find(x => x.id === parseInt(id));
                        console.test(ar);
                        if (!ar) return sender.argsError("<p>autoresponder remove <id>", prefix, "<id>", "Musisz podać istniejący autoresponder");
                        guildConf.autoresponders.deleteOne(ar);
                        await guildConf.update({
                            autoresponders: guildConf.autoresponders,
                        });
                        sender.create(`Usunieto autoresponder o ID: \`${id}\``);
                        return;
                    }
                    case "list": {
                        const all = guildConf.autoresponders;
                        if (!all || all.length === 0) return sender.error("Nie znaleziono autoresponderów na tym serwerze");
                        const arr = all.chunk(5).reverse();

                        const embeds = [];

                        for (const smallArr of arr) {
                            const embed = new client.Embed(message)
                                .setDescription("<:icon_settings:705076529561862174> **Lista autoresponderów**");
                            for (const smallArr2 of smallArr) embed.addField(`Autoresponder ${smallArr2.id}`, `Wiadomość na która reaguje: ${smallArr2.msg}\nWiadomość którą odpowiada: ${smallArr2.reply}`);
                            embeds.push(embed);
                        }
                        new ReactionMenu({
                            channel: message.channel,
                            pages: embeds,
                            userID: message.author.id,
                            message: message,
                        });
                        return;
                    }

                    default: {
                        const embed = new client.Embed(message)
                            .setDescription("<:icon_settings:705076529561862174> **Konfiguracja autoresponderów**")
                            .addField("Dodawanie autorespondera", `\`${prefix}config autoresponders add <wiadomość wywoławcza>;<odpowiedź>\``)
                            .addField("Usuwanie kanału", `\`${prefix}config autoresponders remove <ID>\``)
                            .addField("Resetowanie kanałów", `\`${prefix}config autoresponders reset\``);
                        return message.reply(embed);
                    }
                }
            }

            case "muted": {
                switch (args[1]) {
                    case "set": {
                        const muted = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                        if (!muted) return sender.argsError("<p>config muted set <rola>", prefix, "<rola>");
                        await guildConf.update({ mutedRole: muted.id });

                        return sender.create(`Ustawiono role muted na <@&${muted.id}>`);
                    }
                    case "remove": {
                        await guildConf.update({ mutedRole: null });
                        return sender.create(`Usunięto role muted`);
                    }
                    case "auto": {
                        message.channel.startTyping(1);
                        if (guildConf.mutedRole && message.guild.roles.cache.get(guildConf.mutedRole)) {
                            const role = message.guild.roles.cache.get(guildConf.mutedRole);
                            message.guild.channels.cache.forEach(channel => {
                                channel.updateOverwrite(role, {
                                    SEND_MESSAGES: false,
                                    SPEAK: false,
                                    ADD_REACTIONS: false,
                                }).catch(() => {
                                });
                            });
                            if (role) await guildConf.update({ mutedRole: role.id });
                        } else {
                            message.guild.roles.create({
                                data: {
                                    name: "Wyciszony",
                                    color: "#ff1100",
                                    permissions: [],
                                },
                            }).then(async role => {
                                message.guild.channels.cache.forEach(async channel => {
                                    channel.updateOverwrite(role, {
                                        SEND_MESSAGES: false,
                                        SPEAK: false,
                                        ADD_REACTIONS: false,
                                    }).catch(() => {
                                    });
                                    if (!role) await guildConf.update({ mutedRole: null });
                                    if (role) await guildConf.update({ mutedRole: role.id });
                                });
                            }).catch(() => {
                            });
                        }
                        message.channel.stopTyping(1);
                        return sender.create(`Ustawiono automatycznie role muted`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription("<:icon_settings:705076529561862174> **Konfiguracja roli muted**")
                            .addField("Ustawianie roli muted", `\`${prefix}config muted set <role>\``)
                            .addField("Usuwanie roli muted", `\`${prefix}config muted remove\``)
                            .addField("Automatyczna konfiguracja roli muted", `\`${prefix}config muted auto\``)
                            .addField("Aktualna rola muted:", `<@&${guildConf.mutedRole}>`);
                        return message.reply(embed);
                    }
                }
            }

            case "modlog": {
                switch (args[1]) {
                    case "channel": {
                        const channel = client.channels.cache.get(args[2]) || message.guild.channels.cache.find(x => x.name === args[2]) || message.mentions.channels.first();
                        if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store"
                            || channel.type === "category" || channel.type === "voice" || channel.type === "dm") {
                            return sender.argsError("<p>config modlog channel <kanał>", prefix, "<kanał>");
                        }
                        await guildConf.update({ modlog: { channel: channel.id } });
                        return sender.create(`Ustawiono kanał modlog na <#${channel.id}>`);
                    }
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config modlog status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ modlog: { status: bool } });
                        return sender.create(`Ustawiono status modlogu na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja modlog**\n\nKomendy konfiguracyjne:\n\`${prefix}config modlog channel <kanał>\`\n\`${prefix}config modlog status <on/off>\``)
                            .addField("Status modlogu", `\`${guildConf.modlog.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Kanał modlog", `${guildConf.modlog.channel ? `<#${guildConf.modlog.channel}>` : "`Brak`"}`);
                        return message.reply(embed);
                    }
                }
            }

            case "prefixes":
            case "prefix": {
                switch (args[1]) {
                    case "add": {
                        const prefixProvided = args[2];
                        if (!prefixProvided) return sender.argsError("<p>config prefixes remove <prefix>", prefix, "<prefix>");
                        const arr = guildConf.prefixes || [];
                        if (arr.includes(prefixProvided)) return sender.argsError("<p>config prefixes remove <prefix>", prefix, "<prefix>", "Prefix jest już dodany");
                        arr.push(prefixProvided);
                        await guildConf.update({
                            prefixes: arr,
                        });
                        return sender.create(`Dodano prefix ${prefixProvided}`);
                    }
                    case "remove": {
                        const prefixProvided = args[2];
                        if (!prefixProvided) return sender.argsError("<p>config prefixes remove <prefix>", prefix, "<prefix>");
                        const arr = guildConf.prefixes || [];
                        if (!arr.includes(prefixProvided)) return sender.argsError("<p>config prefixes remove <prefix>", prefix, "<prefix>", "Prefix musi być dodany");
                        arr.deleteOne(prefixProvided);
                        await guildConf.update({
                            prefixes: arr,
                        });
                        return sender.create(`Usunieto prefix ${prefixProvided}`);
                    }
                    default: {
                        const list = guildConf.prefixes.map(r => `${r}`).join("\n");

                        const embed = new client.Embed(message)
                            .setDescription("<:icon_settings:705076529561862174> **Konfiguracja prefixów**")
                            .addField("Dodawanie prefixu", `\`${prefix}config prefixes add <prefix>\``)
                            .addField("Usuwanie prefixu", `\`${prefix}config prefixes remove <prefix>\``)
                            .addField("Lista prefixów:", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                        return message.reply(embed);
                    }
                }
            }

            case "greetings": {
                switch (args[1]) {
                    case "channel": {
                        const channel = client.channels.cache.get(args[2]) || message.guild.channels.cache.find(x => x.name === args[2]) || message.mentions.channels.first();
                        if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store"
                            || channel.type === "category" || channel.type === "voice" || channel.type === "dm") {
                            return sender.argsError("<p>config greetings channel <kanał>", prefix, "<kanał>");
                        }
                        await guildConf.update({ welcome: { channel: channel.id } });
                        return sender.create(`Ustawiono kanał powitań na <#${channel.id}>`);
                    }
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config greetings status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ welcome: { status: bool } });
                        return sender.create(`Ustawiono status powitań na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "message": {
                        const text = args.slice(2).join(" ");
                        if (!text) return sender.argsError("<p>config greetings message <tekst>", prefix, "<tekst>");
                        await guildConf.update({ welcome: { message: text } });
                        return sender.create(`Ustawiono tekst powitań na ${text}`);
                    }
                    case "title": {
                        const text = args.slice(2).join(" ");
                        if (!text) return sender.argsError("<p>config greetings title <tekst>", prefix, "<tekst>");
                        await guildConf.update({ welcome: { title: text } });
                        return sender.create(`Ustawiono tytuł powitań na ${text}`);
                    }
                    case "color": {
                        const color = args.slice(2).join(" ");
                        if (!color || (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))) return sender.argsError("<p>config greetings color <kolor>", prefix, "<kolor>", "Kolor musi być w formacie hex (#ffffff).");
                        await guildConf.update({ welcome: { color: color } });
                        return sender.create(`Ustawiono kolor powitań na ${color}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja powitań**\n\nKomendy konfiguracyjne:\n\`${prefix}config welcome channel <kanał>\`\n\`${prefix}config welcome status <on/off>\`\n\`${prefix}config welcome message <treść>\`\n\`${prefix}config welcome title <treść>\`\n\`${prefix}config welcome color <kolor hex>\``)
                            .addField("Status powitań", `\`${guildConf.welcome.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Wiadomość powitań", `\`${guildConf.welcome.message || "Brak"}\``)
                            .addField("Tytuł powitań", `\`${guildConf.welcome.title || "Brak"}\``)
                            .addField("Kanał powitań", `${guildConf.welcome.channel ? `<#${guildConf.welcome.channel}>` : "`Brak`"}`)
                            .addField("Kolor powitań", `\`${guildConf.welcome.color}\``)
                            .addField("Zmienne", "`{guild}` - Nazwa serwera (`Delover | Wsparcie`)\n`{guild.members}` - Ilość osób (`139`)\n`{guild.id}` - ID serwera (`703156079890268180`)\n`{user}` - Oznaczenie użytkownika (`@Aleks1123#0001`)\n`{user.username}` - Nazwa użytkownika (`Aleks1123`)\n`{user.tag}` - Tag użytkownika (`Aleks1123#0001`)\n`{user.id}` - ID użytkownika (`435029733344804874`)");
                        return message.reply(embed);
                    }
                }
            }

            case "goodbye": {
                switch (args[1]) {
                    case "channel": {
                        const channel = client.channels.cache.get(args[2]) || message.guild.channels.cache.find(x => x.name === args[2]) || message.mentions.channels.first();
                        if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store" || channel.type === "category" || channel.type === "voice" || channel.type === "dm") return sender.argsError("<p>config goodbye channel <kanał>", prefix, "<kanał>");
                        await guildConf.update({ goodbye: { channel: channel.id } });
                        return sender.create(`Ustawiono kanał pożegnań na <#${channel.id}>`);
                    }
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config goodbye status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ goodbye: { status: bool } });
                        return sender.create(`Ustawiono status pożegnań na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "message": {
                        const text = args.slice(2).join(" ");
                        if (!text) return sender.argsError("<p>config goodbye message <tekst>", prefix, "<tekst>");
                        await guildConf.update({ goodbye: { message: text } });
                        return sender.create(`Ustawiono tekst pożegnań na ${text}`);
                    }
                    case "title": {
                        const text = args.slice(2).join(" ");
                        if (!text) return sender.argsError("<p>config goodbye title <tekst>", prefix, "<tekst>");
                        await guildConf.update({ goodbye: { title: text } });
                        return sender.create(`Ustawiono tytuł pożegnań na ${text}`);
                    }
                    case "color": {
                        const color = args.slice(2).join(" ");
                        if (!color || (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))) return sender.argsError("<p>config greetings color <kolor>", prefix, "<kolor>", "Kolor musi być w formacie hex (#ffffff).");
                        await guildConf.update({ goodbye: { color: color } });
                        return sender.create(`Ustawiono kolor pożegnań na ${color}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja pożegnań**\n\nKomendy konfiguracyjne:\n\`${prefix}config goodbye channel <kanał>\`\n\`${prefix}config goodbye status <on/off>\`\n\`${prefix}config goodbye message <treść>\`\n\`${prefix}config goodbye title <treść>\`\n\`${prefix}config goodbye color <kolor hex>\``)
                            .addField("Status pożegnań", `\`${guildConf.goodbye.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Wiadomość pożegnań", `\`${guildConf.goodbye.message || "Brak"}\``)
                            .addField("Tytuł pożegnań", `\`${guildConf.goodbye.title || "Brak"}\``)
                            .addField("Kanał pożegnań", `${guildConf.goodbye.channel ? `<#${guildConf.goodbye.channel}>` : "`Brak`"}`)
                            .addField("Kolor pożegnań", `\`${guildConf.goodbye.color}\``)
                            .addField("Zmienne", "`{guild}` - Nazwa serwera (`Delover | Wsparcie`)\n`{guild.members}` - Ilość osób (`139`)\n`{guild.id}` - ID serwera (`703156079890268180`)\n`{user}` - Oznaczenie użytkownika (`@Aleks1123#0001`)\n`{user.username}` - Nazwa użytkownika (`Aleks1123`)\n`{user.tag}` - Tag użytkownika (`Aleks1123#0001`)\n`{user.id}` - ID użytkownika (`435029733344804874`)");
                        return message.reply(embed);
                    }
                }
            }

            case "colors": {
                switch (args[1]) {
                    case "done": {
                        const color = args.slice(2).join(" ");
                        if (!color || (!/^#([0-9a-f]{3|[0-9a-f]{6})$/i.test(color))) return sender.argsError("<p>config colors done <kolor>", prefix, "<kolor>", "Kolor musi być w formacie hex (#ffffff).");
                        await guildConf.update({ colors: { done: color } });
                        message.guild.settings.colors.done = color;
                        return sender.create(`Ustawiono kolor podstawowy na ${color}`);
                    }
                    case "error": {
                        const color = args.slice(2).join(" ");
                        if (!color || (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))) return sender.argsError("<p>config colors error <kolor>", prefix, "<kolor>", "Kolor musi być w formacie hex (#ffffff).");
                        await guildConf.update({ colors: { error: color } });
                        message.guild.settings.colors.error = color;
                        return sender.create(`Ustawiono kolor błędu na ${color}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja kolorów**\n\nKomendy konfiguracyjne:\n\`${prefix}config colors done <kolor>\`\n\`${prefix}config colors error <kolor>\`\n`)
                            .addField("Kolor postawowy", `\`${guildConf.colors.done}\``)
                            .addField("Kolor błędu", `\`${guildConf.colors.error}\``);
                        return message.reply(embed);
                    }
                }
            }

            case "autorole": {
                switch (args[1]) {
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config antyinvite status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ autorole: { status: bool } });
                        return sender.create(`Ustawiono status autorole na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "roles": {
                        switch (args[2]) {
                            case "add": {
                                const role = message.guild.roles.cache.get(args[3]) || message.guild.roles.cache.find(x => x.name === args[3]) || message.mentions.roles.first();
                                if (!role) return sender.argsError("<p>config autorole roles add <rola>", prefix, "<rola>");
                                const arr = guildConf.autorole.roles || [];
                                if (arr.includes(role.id)) return sender.argsError("<p>config autorole roles add <rola>", prefix, "<rola>", "Rola nie może być już dodana");
                                arr.push(role.id);
                                await guildConf.update({
                                    autorole: { roles: arr },
                                });
                                return sender.create(`Dodano role <@&${role.id}> do bypassu na antyinvite`);
                            }
                            case "remove": {
                                const role = message.guild.roles.cache.get(args[3]) || message.guild.roles.cache.find(x => x.name === args[3]) || message.mentions.roles.first();
                                if (!role) return sender.argsError("<p>config autorole roles remove <rola>", prefix, "<rola>");
                                const arr = guildConf.autorole.roles || [];
                                if (!arr.includes(role.id)) return sender.argsError("<p>config autorole roles remove <rola>", prefix, "<rola>", "Rola musi być już dodana");
                                arr.deleteOne(role.id);
                                await guildConf.update({
                                    autorole: {
                                        roles: arr,
                                    },
                                });
                                return sender.create(`Usunieto role ${role} z bypassu antyinvite`);
                            }
                            case "list": {
                                const list = guildConf.autorole.roles.map(r => `<@&${r}>`).join(",");

                                return sender.create(`Lista roli:\n${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                            }

                            case "reset": {
                                await guildConf.update({
                                    autorole: {
                                        roles: [],
                                    },
                                });
                                return sender.create(`Zresetowano role bypassu antyinvite`);
                            }

                            default: {
                                const list = guildConf.autorole.roles.map(r => `<@&${r}>`).join("\n");

                                const embed = new client.Embed(message)
                                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja autorole**")
                                    .addField("Dodawanie roli", `\`${prefix}config autorole roles add <rola>\``)
                                    .addField("Usuwanie roli", `\`${prefix}config autorole roles remove <rola>\``)
                                    .addField("Resetowanie roli", `\`${prefix}config autorole roles reset\``)
                                    .addField("Lista roli:", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                                return message.reply(embed);
                            }
                        }
                    }
                }
                return;
            }

            case "antyinvite": {
                switch (args[1]) {
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config antyinvite status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ antyinvite: { status: bool } });
                        return sender.create(`Ustawiono status antyinvite na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "roles": {
                        switch (args[2]) {
                            case "add": {
                                const role = message.guild.roles.cache.get(args[3]) || message.guild.roles.cache.find(x => x.name === args[3]) || message.mentions.roles.first();
                                if (!role) return sender.argsError("<p>config antyinvite roles add <rola>", prefix, "<rola>");
                                const arr = guildConf.antyinvite.roles || [];
                                if (arr.includes(role.id)) return sender.argsError("<p>config antyinvite roles add <rola>", prefix, "<rola>", "Rola nie może być już dodana");
                                arr.push(role.id);
                                await guildConf.update({
                                    antyinvite: { roles: arr },
                                });
                                return sender.create(`Dodano role <@&${role.id}> do bypassu na antyinvite`);
                            }
                            case "remove": {
                                const role = message.guild.roles.cache.get(args[3]) || message.guild.roles.cache.find(x => x.name === args[3]) || message.mentions.roles.first();
                                if (!role) return sender.argsError("<p>config antyinvite roles remove <rola>", prefix, "<rola>");
                                const arr = guildConf.antyinvite.roles || [];
                                if (!arr.includes(role.id)) return sender.argsError("<p>config antyinvite roles remove <rola>", prefix, "<rola>", "Rola musi być już dodana");
                                arr.deleteOne(role.id);
                                await guildConf.update({
                                    antyinvite: {
                                        roles: arr,
                                    },
                                });
                                return sender.create(`Usunieto role ${role} z bypassu antyinvite`);
                            }
                            case "list": {
                                const list = guildConf.antyinvite.roles.map(r => `<@&${r}>`).join(",");

                                return sender.create(`Lista roli:\n${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                            }

                            case "reset": {
                                await guildConf.update({
                                    antyinvite: {
                                        roles: [],
                                    },
                                });
                                return sender.create(`Zresetowano role bypassu antyinvite`);
                            }

                            default: {
                                const list = guildConf.antyinvite.roles.map(r => `<@&${r}>`).join("\n");

                                const embed = new client.Embed(message)
                                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja roli antyinvite**")
                                    .addField("Dodawanie roli", `\`${prefix}config antyinvite roles add <rola>\``)
                                    .addField("Usuwanie roli", `\`${prefix}config antyinvite roles remove <rola>\``)
                                    .addField("Resetowanie roli", `\`${prefix}config antyinvite roles reset\``)
                                    .addField("Lista roli:", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                                return message.reply(embed);
                            }
                        }
                    }

                    case "channels": {
                        switch (args[2]) {
                            case "add": {
                                const channel = client.channels.cache.get(args[3]) || message.guild.channels.cache.find(x => x.name === args[3]) || message.mentions.channels.first();
                                if (!channel || channel.guild.id !== message.guild.id) return sender.argsError("<p>config antyinvite channels add <kanał>", prefix, "<kanał>");
                                const arr = guildConf.antyinvite.channels || [];
                                if (arr.includes(channel.id)) return sender.argsError("<p>config antyinvite channels add <kanał>", prefix, "<kanał>", "Kanał nie może być już dodany");
                                arr.push(channel.id);
                                await guildConf.update({
                                    antyinvite: { channels: arr },
                                });
                                return sender.create(`Dodano kanał ${channel} do bypassu na antyinvite`);
                            }
                            case "remove": {
                                const channel = client.channels.cache.get(args[3]) || message.guild.channels.cache.find(x => x.name === args[3]) || message.mentions.channels.first();
                                if (!channel || channel.guild.id !== message.guild.id) return sender.argsError("<p>config antyinvite channels remove <kanał>", prefix, "<kanał>");
                                const arr = guildConf.antyinvite.channels || [];
                                if (!arr.includes(channel.id)) return sender.argsError("<p>config antyinvite channels remove <kanał>", prefix, "<kanał>", "Kanał musi być już dodany");
                                arr.deleteOne(channel.id);
                                await guildConf.update({
                                    antyinvite: {
                                        channels: arr,
                                    },
                                });
                                return sender.create(`Usunieto kanał ${channel} z bypassu antyinvite`);
                            }
                            case "list": {
                                const list = guildConf.antyinvite.channels.map(r => `<#${r}>`).join(", ");

                                return sender.create(`Lista roli:\n${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                            }

                            case "reset": {
                                await guildConf.update({
                                    antyinvite: {
                                        channels: [],
                                    },
                                });
                                return sender.create(`Zresetowano kanały bypassu antyinvite`);
                            }
                            default: {
                                const list = guildConf.antyinvite.channels.map(r => `<#${r}>`).join("\n");

                                const embed = new client.Embed(message)
                                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja kanałów antyinvite**")
                                    .addField("Dodawanie kanału", `\`${prefix}config antyinvite channels add <kanał>\``)
                                    .addField("Usuwanie kanału", `\`${prefix}config antyinvite channels remove <kanał>\``)
                                    .addField("Resetowanie kanałów", `\`${prefix}config antyinvite channels reset\``)
                                    .addField("Lista kanałow", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                                return message.reply(embed);
                            }
                        }
                    }
                    default: {
                        const channelslist = guildConf.antyinvite.channels.map(r => `<#${r}>`).join("\n");
                        const roleslist = guildConf.antyinvite.roles.map(r => `<@&${r}>`).join("\n");

                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja antyinvite**\n\nKomendy konfiguracyjne:\n\`${prefix}config antyinvite status <on/off>\`\n\`${prefix}config antyinvite roles\`\n\`${prefix}config antyinvite channels\``)
                            .addField("Status", `\`${guildConf.antynvite?.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Bypass kanałów", `${channelslist.length > 1027 ? "Zbyt długie by wyświetlić" : channelslist || "Brak"}`)
                            .addField("Bypass roli", `${roleslist.length > 1027 ? "Zbyt długie by wyświetlić" : roleslist || "Brak"}`);

                        return message.reply(embed);
                    }
                }
            }

            case "proposals": {
                switch (args[1]?.toLowerCase()) {
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config antyinvite status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ proposals: { status: bool } });
                        return sender.create(`Ustawiono status propozycji na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "comment": {
                        const text = args[2];
                        if (!text) return sender.argsError("<p>config antyinvite comment <komenatrz>", prefix, "<komentarz>");
                        await guildConf.update({ proposals: { comment: text } });
                        return sender.create(`Ustawiono komenatrz na ${text}`);
                    }
                    case "channels": {
                        switch (args[2]) {
                            case "add": {
                                const channel = client.channels.cache.get(args[3]) || message.guild.channels.cache.find(x => x.name === args[3]) || message.mentions.channels.first();
                                if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store"
                                    || channel.type === "category" || channel.type === "dm") {
                                    return sender.argsError("<p>config antyinvite channels add <kanał>", prefix, "<kanał>");
                                }
                                const arr = guildConf.proposals.channels || [];
                                if (arr.includes(channel.id)) return sender.argsError("<p>config antyinvite channels add <kanał>", prefix, "<kanał>", "Kanał nie może być już dodany");

                                arr.push(channel.id);

                                guildConf.update({
                                    proposals: { channels: arr },
                                });
                                return sender.create(`Dodano kanał <#${channel.id}> do propozycji`);
                            }
                            case "remove": {
                                const channel = client.channels.cache.get(args[3]) || message.guild.channels.cache.find(x => x.name === args[3]) || message.mentions.channels.first();
                                if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store"
                                    || channel.type === "category" || channel.type === "dm") {
                                    return sender.argsError("<p>config antyinvite channels add <kanał>", prefix, "<kanał>");
                                }
                                const arr = guildConf.proposals.channels || [];
                                if (!arr.includes(channel.id)) return sender.argsError("<p>config antyinvite channels remove <kanał>", prefix, "<kanał>", "Kanał musi być już dodany");
                                arr.deleteOne(channel.id);

                                guildConf.update({
                                    proposals: { channels: arr },
                                });
                                return sender.create(`Usunieto kanał <#${channel.id}> do propozycji`, "<:icon_settings:705076529561862174> Ustawienia");
                            }
                            case "list": {
                                return sender.create(`Aktualne kanały propozycji: ${guildConf.proposals.channels?.map(x => `<#${x}>`).join(" | ") || "Brak"}`);
                            }

                            case "reset": {
                                await guildConf.update({
                                    proposals: {
                                        channels: [],
                                    },
                                });
                                return sender.create(`Zresetowano role bypassu antyinvite`);
                            }

                            default: {
                                const embed = new client.Embed(message)
                                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja kanałow propozycji**")
                                    .addField("Dodawanie kanału", `\`${prefix}config proposals channels add <kanał>\``)
                                    .addField("Usuwanie kanału", `\`${prefix}config proposals channels remove <kanał>\``)
                                    .addField("Resetowanie roli", `\`${prefix}config proposals channels reset\``)
                                    .addField("Lista kanałow:", `${guildConf.proposals.channels?.map(x => `<#${x}>`).join(" | ") || "Brak"}`);

                                return message.reply(embed);
                            }
                        }
                    }

                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja propozycji**\n\nKomendy konfiguracyjne:\n\`${prefix}config proposals status <on/off>\`\n\`${prefix}config proposals comment <komentarz>\`\n\`${prefix}config proposals channels\`\n`)
                            .addField("Status propozycji", `\`${guildConf.proposals?.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Komentarz w propozycjach", `\`${guildConf.proposals?.comment}\``)
                            .addField("Kanały propozycji", `\`${guildConf.proposals.channels?.map(x => `<#${x}>`).join(" | ") || "Brak"}\` (By dodać wpisz \`${prefix}config proposals channels\`)`);
                        return message.reply(embed);
                    }
                }
            }

            case "leveling": {
                switch (args[1]?.toLowerCase()) {
                    case "message": {
                        switch (args[2]?.toLowerCase()) {
                            case "text": {
                                const text = args.slice(3).join(" ");
                                if (!text) return sender.argsError("<p>config leveling message <tekst>", prefix, "<tekst>");
                                await guildConf.update({ leveling: { message: { text } } });
                                return sender.create(`Ustawiono tekst nowego poziomu na ${text}`);
                            }
                            default:
                                const embed = new client.Embed(message)
                                    .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja wiadomości poziomu**\n\nKomendy konfiguracyjne:\n\`${prefix}config leveling message text <tresc>\``)
                                    .addField("Wiadomość", `\`${guildConf.leveling.message.text || "Brak"}\``)
                                    .addField("Zmienne", "`{guild}` - Nazwa serwera (`Delover | Wsparcie`)\n`{guild.members}` - Ilość osób (`139`)\n`{guild.id}` - ID serwera (`703156079890268180`)\n`{user}` - Oznaczenie użytkownika (`@Aleks1123#0001`)\n`{user.username}` - Nazwa użytkownika (`Aleks1123`)\n`{user.tag}` - Tag użytkownika (`Aleks1123#0001`)\n`{user.id}` - ID użytkownika (`435029733344804874`)");
                                return message.reply(embed);
                        }
                    }

                    case "xp": {
                        if (!guildConf.premium.status) return sender.error("Zmiana mnożnika jest dostępna tylko dla premium");
                        const xp = parseInt(args.slice[3]);
                        if (!xp) return sender.argsError("<p>config leveling xp <xp>", prefix, "<xp>");
                        await guildConf.update({ leveling: { xpNeeded: xp } });
                        return sender.create(`Ustawiono mnożnik poziomów na ${xp}`);
                    }

                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config leveling status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ leveling: { status: bool } });
                        return sender.create(`Ustawiono status poziomów na ${bool ? "Włączone" : "Wyłączone"}`);
                    }

                    case "roles": {
                        switch (args[2]) {
                            case "add": {
                                const role = message.guild.roles.cache.get(args[4]) || message.guild.roles.cache.find(x => x.name === args[4]) || message.mentions.roles.first();
                                const level = parseInt(args[3]);
                                if (!role) return sender.argsError("<p>config antyinvite roles add <poziom> <rola>", prefix, "<rola>");
                                if (!level) return sender.argsError("<p>config antyinvite roles add <poziom> <rola>", prefix, "<poziom>");
                                const arr = guildConf.antyinvite.roles || [];
                                if (arr.find(x => x.level === level)) return sender.argsError("<p>config leveling roles add <poziom> <rola>", prefix, "<poziom>", "Poziom nie może być już dodany");
                                arr.push({
                                    level: level,
                                    roleid: role.id,
                                });
                                await guildConf.update({
                                    leveling: { roles: arr },
                                });
                                return sender.create(`Dodano role <@&${role.id}> do roli poziomów`);
                            }
                            case "remove": {
                                const level = parseInt(args[3]);
                                if (!level) return sender.argsError("<p>config leveling roles remove <poziom>", prefix, "<poziom>");
                                const arr = guildConf.leveling.roles || [];
                                if (!arr.find(x => x.level === level)) return sender.argsError("<p>config leveling roles remove <poziom>", prefix, "<poziom>", "Poziom musi byc dodany");
                                arr.deleteOne(arr.find(x => x.level === level));
                                await guildConf.update({
                                    leveling: {
                                        roles: arr,
                                    },
                                });
                                return sender.create(`Usunieto poziom ${level} z roli poziomów`);
                            }
                            case "list": {
                                const list = guildConf.leveling.roles.map(r => `<@&${r}>`).join(",");

                                return sender.create(`Lista roli:\n${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                            }

                            case "reset": {
                                await guildConf.update({
                                    leveling: {
                                        roles: [],
                                    },
                                });
                                return sender.create(`Zresetowano role za poziomy`);
                            }

                            default: {
                                const list = guildConf.leveling.roles.map(r => `${r.level} : <@&${r.roleid}>`).join("\n");

                                const embed = new client.Embed(message)
                                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja roli poziomów**")
                                    .addField("Dodawanie roli", `\`${prefix}config leveling roles add <poziom> <rola>\``)
                                    .addField("Usuwanie roli", `\`${prefix}config leveling roles remove <poziom>\``)
                                    .addField("Resetowanie roli", `\`${prefix}config leveling roles reset\``)
                                    .addField("Lista roli:", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                                return message.reply(embed);
                            }
                        }
                    }


                    default: {
                        const list = guildConf.leveling.roles.map(r => `${r.level} : <@&${r.roleid}>`).join("\n");

                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja propozycji**\n\nKomendy konfiguracyjne:\n\`${prefix}config leveling status <on/off>\`\n\`${prefix}config leveling xp <xp>\` **(PREMIUM)**\n\`${prefix}config leveling message\`\n\`${prefix}config leveling roles\``)
                            .addField("Status poziomów", `\`${guildConf.leveling?.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Mnożnik poziomów (\`xp\`)", `\`${guildConf.leveling?.xpNeeded}\``)
                            .addField("Wiadomość", `\`${guildConf.leveling?.message.text}\``)
                            .addField("Role", `${list.length > 1027 ? "Zbyt długie by wyświetlić" : list || "Brak"}`);
                        return message.reply(embed);
                    }
                }
            }

            case "show": {
                const embed = new client.Embed(message)
                    .setDescription("<:icon_settings:705076529561862174> **Konfiguracja**")
                    .addField(`${guildConf.welcome.channel && guildConf.welcome.status && message.guild.channels.cache.get(guildConf.welcome.channel) ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Powitania`, `**Status:** ${guildConf.welcome.status ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}\n**Kanał:** ${message.guild.channels.cache.get(guildConf.welcome.channel) || "`Brak`"}\n**Tytuł wiadomości:**: \`${guildConf.welcome.title.length > 100 ? "Zbyt długi by wyświetlić" : guildConf.welcome.title}\`\n**Wiadomość:** \`${guildConf.welcome.message.length > 500 ? "Zbyt długa by wyświetlić" : guildConf.welcome.message}\`\n**Kolor:** \`${guildConf.welcome.color}\``)
                    .addField(`${guildConf.welcome.channel && guildConf.goodbye.status && message.guild.channels.cache.get(guildConf.goodbye.channel) ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Pożegnania`, `**Status:** ${guildConf.goodbye.status ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}\n**Kanał:** ${message.guild.channels.cache.get(guildConf.goodbye.channel) || "`Brak`"}\n**Tytuł wiadomości:**: \`${guildConf.goodbye.title.length > 100 ? "Zbyt długi by wyświetlić" : guildConf.goodbye.title}\`\n**Wiadomość:** \`${guildConf.goodbye.message.length > 500 ? "Zbyt długa by wyświetlić" : guildConf.goodbye.message}\`\n**Kolor:** \`${guildConf.goodbye.color}\``)
                    .addField(`<a:on:840947203110600767> Prefixy`, `**Prefixy:** \`${guildConf.prefixes.join(" | ")}\``)
                    .addField(`<a:on:840947203110600767> Kolory`, `**Kolor podstawowy:** \`${guildConf.colors.done}\`\n**Kolor błędu:** \`${guildConf.colors.error}\``)
                    .addField(`${guildConf.antyinvite.status ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Antyinvite`, `**Kanały antyinvite:** ${guildConf.antyinvite.channels.map(r => `<@&${r}>`).join(",").length > 500 ? "Zbyt duże by pokazać" : guildConf.antyinvite.channels.map(r => `<#${r}>`).join(", ") || "`Brak`"}\n**Role antyinvite:** ${guildConf.antyinvite.roles.map(r => `<@&${r}>`).join(", ").length > 500 ? "Zbyt duże by pokazać" : guildConf.antyinvite.roles.map(r => `<@&${r}>`).join(",") || "`Brak`"}`)
                    .addField(`${guildConf.modlog.status && guildConf.modlog.channel && message.guild.channels.cache.get(guildConf.modlog.channel) ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Modlog`, `**Status:** ${guildConf.welcome.status ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}\n**Kanał:** ${message.guild.channels.cache.get(guildConf.modlog.channel) || "`Brak`"}`)
                    .addField(`${guildConf.proposals.status && guildConf.proposals.channels.some(x => message.guild.channels.cache.get(x)) ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Propozycje`, `**Status:** ${guildConf.proposals.status ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}\n**Komentarz:** \`${guildConf.proposals.comment}\`\n**Kanały:** ${guildConf.antyinvite.channels.map(r => `<@&${r}>`).join(",").length > 500 ? "Zbyt duże by pokazać" : guildConf.antyinvite.channels.map(r => `<#${r}>`).join(", ") || "`Brak`"}`)
                    .addField(`${guildConf.leveling.status ? "<a:on:840947203110600767>" : "<a:off:840947229279387679>"} Poziomy`, `**Status:** ${guildConf.leveling.status ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}\n**Treść wiadomości:** \`${guildConf.leveling.message.text}\`\n**Embed wiadomości: ${guildConf.leveling.message.embed ? "<:check_green:814098229712781313>" : "<:check_red:814098202063405056>"}**\n**Role za poziomy:** ${guildConf.leveling.roles.length ? "\n" : ""}${guildConf.leveling.roles.map(r => `${r.level} : <@&${r.roleid}>`).join("\n").length > 500 ? "Zbyt duże by wyświetlić" : guildConf.leveling.roles.map(r => `${r.level} : <@&${r.roleid}>`).join("\n") || "Brak"}`);

                return message.reply(embed);
            }

            case "broadcast": {
                switch (args[1]) {
                    case "channel": {
                        const channel = client.channels.cache.get(args[2]) || message.guild.channels.cache.find(x => x.name === args[2]) || message.mentions.channels.first();
                        if (!channel || channel.guild.id !== message.guild.id || channel.type === "voice" || channel.type === "store" || channel.type === "category" || channel.type === "voice" || channel.type === "dm") return sender.argsError("<p>config goodbye channel <kanał>", prefix, "<kanał>");
                        await guildConf.update({ broadcast: { channel: channel.id } });
                        return sender.create(`Ustawiono kanał ogłoszeń na <#${channel.id}>`);
                    }
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config goodbye status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ broadcast: { status: bool } });
                        return sender.create(`Ustawiono status ogłoszeń na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    case "color": {
                        const color = args.slice(2).join(" ");
                        if (!color || (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))) return sender.argsError("<p>config greetings color <kolor>", prefix, "<kolor>", "Kolor musi być w formacie hex (#ffffff).");
                        await guildConf.update({ broadcast: { color: color } });
                        return sender.create(`Ustawiono kolor ogłoszeń na ${color}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja ogłoszeń**\n\nKomendy konfiguracyjne:\n\`${prefix}config broadcast channel <kanał>\`\n\`${prefix}config broadcast status <on/off>\`\n\`${prefix}config goodbye broadcast <kolor hex>\``)
                            .addField("Status ogłoszeń", `\`${guildConf.broadcast.status ? "Włączone" : "Wyłączone"}\``)
                            .addField("Kanał ogłoszeń", `${guildConf.broadcast.channel ? `<#${guildConf.broadcast.channel}>` : "`Brak`"}`)
                            .addField("Kolor ogłoszeń", `\`${guildConf.broadcast.color}\``);
                        return message.reply(embed);
                    }
                }
            }

            case "snipe": {
                switch (args[1]) {
                    case "status": {
                        const bool = obj[args[2]];
                        if (typeof bool !== "boolean") return sender.argsError("<p>config goodbye status <on/off>", prefix, "<on/off>");
                        await guildConf.update({ snipe: { status: bool } });
                        return sender.create(`Ustawiono status snipe na ${bool ? "Włączone" : "Wyłączone"}`);
                    }
                    default: {
                        const embed = new client.Embed(message)
                            .setDescription(`<:icon_settings:705076529561862174> **Konfiguracja snipe**\n\nKomendy konfiguracyjne:\n\`${prefix}config snipe status <on/off>\``)
                            .addField("Status snipe", `\`${guildConf.snipe.status ? "Włączone" : "Wyłączone"}\``);
                        return message.reply(embed);
                    }
                }
            }

            default: {
                const embed = new client.Embed(message)
                    .addField("Konfiguracja prefixów", `\`${prefix}config prefixes\``)
                    .addField("Konfiguracja powitań", `\`${prefix}config greetings\``)
                    .addField("Konfiguracja pożegnań", `\`${prefix}config goodbye\``)
                    .addField("Konfiguracja kolorów", `\`${prefix}config colors\``)
                    .addField("Konfiguracja antyinvite", `\`${prefix}config antyinvite\``)
                    .addField("Konfiguracja modlog", `\`${prefix}config modlog\``)
                    .addField("Konfiguracja levelingu", `\`${prefix}config leveling\``)
                    .addField("Konfiguracja ogłoszeń", `\`${prefix}config broadcast\``)
                    .addField("Konfiguracja snipe", `\`${prefix}config snipe\``)
                    .addField("Pokazanie konfiguracji", `\`${prefix}config show\``);
                return message.reply(embed);
            }

        }
    }
};

