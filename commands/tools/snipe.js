const BaseCommand = require("../../lib/structures/bot/Command");
const replaceMentions = content => content.replace(/@/g, "@\u200b");
const { Collection } = require("discord.js-light");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "snipe",
            aliases: ["odkasuj", "pokazusunietewiad", "odedytuj"],
            description: "Pokazuje usuniete wiadomości",
            usage: "<p>snipe <numer/list/clean>",
            category: "Narzędzia",
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);
        if (!message.guild.settings.snipe.status) return sender.error("System snipe jest wyłączone");
        if (!message.guild.webhook) return sender.error("Bot nie może stworzyć webhooka");
        if (!client.snipes.get(message.channel.id)) client.snipes.set(message.channel.id, new Collection());
        let i = 0;
        if (args[0] === "list") {
            const array = client.snipes.get(message.channel.id).last(30).reverse();
            if (!array.length) return sender.error("Nie ma żadnych skasowanych wiadomości na tym kanale");
            const chunked = array.chunk(10);
            const embeds = [];
            for (const chunk of chunked) {
                const embed = new client.Embed(message);
                for (const snipe of chunk) {
                    i++;
                    embed.addField(`Wiadomość #${i}`, `Treść: \`${snipe.oldContent?.length > 400 ? "Zbyt długa" : snipe.oldContent || "Brak"}\`${snipe.type === "edit" ? `\nNowa treść: \`${snipe.newContent?.length > 400 ? "Zbyt długa" : snipe.newContent || "Brak"}\`` : ""}\nTyp: ${snipe.type === "edit" ? "Edycja wiadomości" : "Usunięcie wiadomości"}\n${snipe.reference ? `Odpowiedź na [\`Klik\`](https://canary.discord.com/channels/${snipe.reference.guildID}/${snipe.reference.channelID}/${snipe.reference.messageID})` : ""}\nAutor: ${await client.users.fetch(snipe.author)}`);
                }


                embeds.push(embed);
            }
            new ReactionPageMenu({
                channel: message.channel,
                message,
                userID: message.author.id,
                pages: embeds,
            });
        } else if (args[0] === "clean") {
            if (message.member.permissionLevel < 3) return sender.error("Nie masz uprawnien");

            client.snipes.delete(message.channel.id);

            sender.create("Usunięto skasowane wiadomości z tego kanału");
        } else if (args[0] === "clear") {
            if (message.member.permissionLevel < 3) return sender.error("Nie masz uprawnien");

            client.snipes.delete(message.channel.id);

            sender.create("Usunięto skasowane wiadomości z tego kanału");
        } else {
            const lastSnipe = args[0] ? (client.snipes.get(message.channel.id).last(parseInt(args[0])).length === parseInt(args[0]) ? client.snipes.get(message.channel.id).last(parseInt(args[0]))[0] : null) : client.snipes.get(message.channel.id).last();
            if (!lastSnipe) return sender.error("Nie znaleziono takiej wiadomości");
            const user = await client.users.fetch(lastSnipe.author).catch(() => null);
            if (!user) return sender.error("Problem ze znalezieniem uzytkownika");
            await message.guild.webhook.setChannel(message.channel.id);
            let content = lastSnipe.oldContent || "[Brak]";
            if (content.length < 1086 && message.reference) content += `\n> Odpowiedź na [\`Klik\`](https://canary.discord.com/channels/${lastSnipe.reference.guildID}/${lastSnipe.reference.channelID}/${lastSnipe.reference.messageID})`;
            await message.guild.webhook.send(replaceMentions(content), {
                username: user.username,
                avatarURL: user.displayAvatarURL(),
                disableMentions: "everyone",
                files: lastSnipe.attachments,
            });
        }
    }
};