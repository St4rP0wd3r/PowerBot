const BaseCommand = require("../../lib/structures/bot/Command");


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "poll",
            aliases: ["ankieta"],
            permissionLevel: 4,
            description: "Tworzy ankiete",
            usage: "<p>poll <pytanie> lub <tytuł> <odpowiedź 1> & <odpowiedź 2> (max 10 odpowiedzi)",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);

        if (!args.length) return sender.argsError(this.help.usage, prefix, "<pytanie>");
        const reason = args.join(" ").replace(" & ", "&").split("&");
        const anserws = [...reason].slice(1);
        if (anserws.length) {
            const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

            let text = "";
            if (anserws.length > 10) return sender.error("Liczba pozycji nie może przekraczać 10.");

            anserws.forEach((r, i) => {
                if (i === 0) text += `${emoji[i]} - ${r}`;
                if (i > 0) text += `\n${emoji[i]} - ${r}`;
            });
            const embed = new client.Embed()
                .setTitle(reason[0])
                .setDescription(text)
                .setColor("GREEN")
                .setAuthor(message.author.tag, message.author.displayAvatarURL(ImageURLOptions));

            message.channel.send(embed).then((m) => {
                anserws.forEach(async (r, i) => {
                    await m.react(emoji[i]);
                });
            });
        } else {
            const embed = new client.Embed()
                .setTitle("📊 Ankieta")
                .setDescription(reason)
                .setColor("GREEN")
                .setAuthor(message.author.tag, message.author.displayAvatarURL(ImageURLOptions));

            const m = await message.channel.send(embed);
            let reactions = ["814098229712781313", "814098094743486468", "814098202063405056"];
            reactions.forEach(async (x) => {
                await m.react(x);
            });
        }
    }
};

