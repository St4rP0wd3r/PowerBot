const BaseCommand = require("../../lib/structures/bot/Command");
const Sender = require("../../lib/structures/bot/Sender");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "reload",
            permissionLevel: 6,
            aliases: ["rl"],
            description: "Reloaduje różne rzeczy w bocie",
            usage: "<p>reload",
            category: "Deweloperskie",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "command":
            case "cmd":
            case "c": {
                if (args[1] === "all") {
                    for (const cmd of client.commands.array()) {
                        const reloaded = await cmd.reload().catch(e => e);

                        if (reloaded instanceof Error) return sender.error(`**Błąd!**\n\n\`\`\`${reloaded.stack}\`\`\``);
                    }
                    return sender.create(`Przeładowano wszystkie komendy`);
                }
                if (!args[1]) return sender.argsError("<p>reload cmd <komenda/alias>", prefix, "<komenda/alias>");
                const command = client.commands.get(args[1]) || client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(args[1]));
                if (!command) return sender.argsError("<p>reload cmd <komenda/alias>", prefix, "<komenda/alias>", "Komenda musi być istniejąca");

                const reloaded = await command.reload().catch(e => e);

                if (reloaded instanceof Error) return sender.error(`\`\`\`${reloaded.stack}\`\`\``);

                sender.create(`Przeładowano komende ${command.conf.name}`);

                break;
            }

            case "addcmd":
            case "ac": {
                const path = args[1];
                if (!path) if (!path) return sender.argsError("<p>reload addcmd <ścieżka>", prefix, "<scieżka>", "Przykład: fun/mem.js");
                const file = require("../../commands/" + path);
                const cmd = new file();

                cmd.conf.fileName = path;

                client.commands.set(cmd.conf.name, cmd);

                sender.create(`Załadowano komende ${cmd.conf.name}`);

                break;
            }

            case "ae":
            case "addev":
            case "addevent": {
                const path = args[1];
                if (!path) return sender.argsError("<p>reload addevent <ścieżka>", prefix, "<scieżka>", "Przykład: bot/ready.js");
                const file = require("../../events/" + path);
                const cmd = new file();

                cmd.conf.fileName = path;

                client.events.set(cmd.conf.name, cmd);

                sender.create(`Załadowano event ${cmd.conf.name}`);

                break;
            }

            case "event":
            case "ev":
            case "e":
            case "l": {
                if (args[1] === "all") {
                    for (const ev of client.events.array()) {
                        const reloaded = await ev.reload().catch(e => e);

                        if (reloaded instanceof Error) return sender.error(`**Błąd!**\n\n\`\`\`${reloaded.stack}\`\`\``);
                    }
                    return sender.create(`Przeładowano wszystkie eventy`);
                }
                if (!args[0]) return sender.argsError("<p>reload event <event>", prefix, "<event>");
                const event = client.events.get(args[1]);
                if (!event) return sender.argsError("<p>reload event <event>", prefix, "<event>", "Event musi być istniejący");

                const reloaded = await event.reload().catch(e => e);

                if (reloaded instanceof Error) return sender.error(`**Błąd!**\n\n\`\`\`${reloaded.stack}\`\`\``);

                sender.create(`Przeładowano event ${event.conf.name}`);

                break;
            }

            default: {
                const embed = new client.Embed(message)
                    .setDescription("<:check_green:814098229712781313> **Reload**")
                    .addField("Przeładowywanie komend", `\`${prefix}reload command <nazwa/alias komendy>\``)
                    .addField("Przeładowywanie eventów", `\`${prefix}reload event <nazwa>\``)
                    .addField("Dodawanie komendy", `\`${prefix}reload addcmd <scieżka>\``)
                    .addField("Dodawanie eventu", `\`${prefix}reload addevent <scieżka>\``);
                message.reply(embed);
                break;
            }
        }

    }

};

