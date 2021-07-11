const BaseCommand = require("../../lib/structures/bot/Command");


const answers = [
    "Tak!",
    "Nie. ",
    "Prawda.",
    "Fałsz.",
    "Nie wiem.",
    "Może...",
    "Chyba...",
    "Chyba tak!",
    "Chyba nie!",
    "Myślę, że nie!",
    "Myślę, że tak!",
    "Oczywiście, że tak!",
    "Oczywiście, że nie!",
    "Masz rację!",
    "Nie masz racji.",
    "Dowiesz się wkrótce...",
    "Takie pytania to nie mi zadawaj",
    "Za kogo ty się masz?",
    "Ojoj. Mózg mi się przegrał!",
    "Nie wiem. Zapytaj wujka Google.",
    "Dowiesz się w swoim czasie.",
    "Moje źródła wiedzy mówią nie.",
    "Moje źródła wiedzy mówią tak.",
    "Ehh. Bez komentarza.",
];

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "8ball",
            aliases: ["eightball"],
            description: "Przewiduje przyszłość.",
            usage: "<p>8ball <pytanie>",
            category: "Zabawa",
            args: [{
                name: "pytanie",
                ifFail: "Musisz podać poprawne pytanie",
                description: "Pytanie",
                required: true,
                check: (args => !(!args[0] || args.join(" ").length > 1024)),
            }],
        });
    }

    async run(message, { args }) {
        const text = args.join(" ");
        const embed = new client.Embed(message)
            .addField("Pytanie", text)
            .setThumbnail("https://cdn.discordapp.com/attachments/777618091621875779/820056872588410880/8-Ball_Pool.svg.png")
            .addField("Odpowiedź", `\`${answers[Math.floor((Math.random() * answers.length))]}\``);
        message.reply(embed);
    }
};

