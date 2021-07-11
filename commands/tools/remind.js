const BaseCommand = require("../../lib/structures/bot/Command");
const Ms = require("../../lib/modules/Ms");
const ReactionMenu = require("../../lib/structures/bot/ReactionPageMenu");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "remind",
            aliases: ["remindme", "przyp", "przypomnij", "przypomnienie"],
            description: "Zarządza przypomnieniami",
            usage: "<p>remind <add/remove/list/view>",
            category: "Narzędzia",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "add": {
                const reminders = await client.database.reminders.getAll(message.author.id);
                if (reminders?.length >= (message.author.userData.premium.status ? 15 : 7)) return sender.error(`Niestety wykorzystałeś już limit przypomnień. Poczekaj aż któreś wygaśnie. Aktualny limit to ${message.author.userData.premium.status ? 15 : 7}.`);
                const time = Ms(args[1]) ? Ms(args[1]) + Date.now() : Date.parse(args[1]?.replace("_", " "));
                if (!time) return sender.argsError("<p>remind add <czas> <tekst>", prefix, "<czas>");
                const text = args.slice(2).join(" ");
                if (!text) return sender.argsError("<p>remind add <czas> <tekst>", prefix, "<tekst>");
                const { remindid } = await client.database.reminders.add(message.author.id, time, text);
                sender.create(`**Dodano przypomnienie!**\nData zakończenia: \`${new Date(time).toLocaleString()}\`\nID: \`${remindid}\``);
                break;
            }
            case "view": {
                const id = args[1];
                if (!id || !parseInt(id)) return sender.argsError("<p>remind view <id>", prefix, "<id>");
                const remind = await client.database.reminders.get(message.author.id, parseInt(id));
                if (!remind) return sender.argsError(this.help.usage, prefix, "<id>");
                const embed = new client.Embed(message)
                    .setDescription(`**ID:** \`${id}\`\n**Data zakończenia:** \`${new Date(remind.end).toLocaleString()}\`\n**Tekst:** \`${remind.text}\``);
                message.reply(embed);
                break;
            }
            case "remove": {
                const id = args[1];
                if (!id || !parseInt(id)) return sender.argsError("<p>remind remove <id>", prefix, "<id>", "Podaj prawidłowe ID reminda!");
                const remind = await client.database.reminders.get(message.author.id, parseInt(id));
                if (!remind) return sender.argsError(this.help.usage, prefix, "<id>", "Nie odnaleziono takiego przypomnienia.");
                remind.remove();
                sender.create(`Usunieto przypomnienie o ID: ${id}`);
                break;
            }
            case "list": {
                const reminders = (await client.database.reminders.getAll(message.author.id))?.reverse();
                if (!reminders?.length) return sender.error("Nie posiadasz przypomnień");
                const embeds = [];
                for (const reminds of reminders.chunk(5)) {
                    const embed = new client.Embed(message)
                        .setDescription(reminders?.length + `/${message.author.userData.premium.status ? 15 : 7}`);
                    for (const remind of reminds) embed.addField(`Remind #${remind.remindid}`, `Data zakończenia: \`${new Date(remind.end).toLocaleString()}\`\nTekst: \`${remind.text}\``);
                    embeds.push(embed);
                }
                new ReactionMenu({
                    channel: message.channel,
                    pages: embeds,
                    userID: message.author.id,
                    message: message,
                });
                break;
            }
            default: {
                const embed = new client.Embed(message)
                    .addField("Dodawanie przypomnienia", `\`${prefix}remind add <czas> <text>\``)
                    .addField("Usuwanie przypomnienia", `\`${prefix}remind remove <ID>\``)
                    .addField("Podejrzenie przypomnienia", `\`${prefix}remind view <ID>\``)
                    .addField("Lista przypomnień", `\`${prefix}remind list\``);
                return message.reply(embed);
            }
        }
    }
};

