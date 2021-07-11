const BaseCommand = require("../../lib/structures/bot/Command");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "gban",
            aliases: ["gdzban", "bl", "blacklist"],
            permissionLevel: 6,
            description: "Blokuje dostep do komend",
            usage: "<p>gban <add/remove/list> [Użytkownik]",
            category: "Deweloperskie",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "add": {
                const member = await client.functions.getUser(message, args[1]);
                if (!member) return sender.error("Nie znaleziono użytkownika");
                const reason = args.slice(2).join(" ") || "Nie podano";
                const usersSettings = await client.database.users.get(member.id);
                if (usersSettings.gban.status) return sender.error("Ten użytkownik ma gbana");
                usersSettings.update({
                    gban: {
                        status: true,
                        reason: reason,
                        developer: message.author.id,
                        date: new Date(),
                    },
                });
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${member.id}>** (\`${member.tag}\`) został pomyślnie globalnie zbanowany.`),
                );
                break;
            }
            case "remove": {
                const member = await client.functions.getUser(message, args[1]);
                if (!member) return sender.error("Nie znaleziono użytkownika");
                const reason = args.slice(2).join(" ") || "Nie podano";

                const usersSettings = await client.database.users.get(member.id);
                if (!usersSettings.gban.status) return sender.error("Ten użytkownik nie ma gbana");
                usersSettings.update({
                    gban: {
                        status: false,
                        reason: null,
                        developer: null,
                        date: null,
                    },
                });
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${member.id}>** (\`${member.tag}\`) został pomyślnie globalnie odbanowany.`),
                );
                break;
            }

            case "list": {
                const list = (await client.database.users.list()).filter(x => x.gban?.status);
                if (!list.length) return sender.error("Nie ma gbanów :<");

                const formatedList = list.chunk(5);
                const embeds = [];
                for (const gbans of formatedList) {
                    const embed = new client.Embed(message)
                        .setTitle("Lista gbanów");
                    for (const gban of gbans) {
                        const user = await client.users.fetch(gban.id);
                        embed.addField(`${user?.tag}`, `Powód: \`${gban.reason}\`\nData: \`${new Date(gban.date).toLocaleString()}\`\nDeveloper: \`${(await client.users.fetch(gban.developer))?.tag}\``);
                    }
                    embeds.push(embed);
                }
                new ReactionPageMenu({
                    message: message,
                    channel: message.channel,
                    pages: embeds,
                    userID: message.author.id,
                });

                break;
            }

            default:
                sender.argsError(this.help.usage, prefix, "<add/remove/list>");
        }
    }
};

