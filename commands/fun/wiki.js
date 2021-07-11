const BaseCommand = require("../../lib/structures/bot/Command");

const wiki = require("wikipedia");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "wiki",
            aliases: ["wikipedia"],
            description: "Wyszukuje cos w wikipedii",
            usage: "<p>wiki <wyszukiwanie>",
            category: "Zabawa",
            flags: "`--search` - Wyszukuje fraze",
        });
    }

    async run(message, { args, prefix, flags }) {
        const sender = new client.Sender(message);
        if (!args[0]) return sender.argsError(this.help.usage, prefix, "<wyszukiwanie>");
        if (flags[0] === "search") {
            const searchResults = await wiki.search(args.join(" "));
            const results = searchResults.results.map(r => `\`${r.title}\``).join("\n");
            sender.create(`${results || "Nie znaleziono takiej frazy"}`);
            return;
        }
        await wiki.setLang("pl");
        const page = await wiki.page(args.join(" ")).catch(async r => {
            const searchResults = await wiki.search(args.join(" "));
            const results = searchResults.results.map(r => `\`${r.title}\``).join("\n");
            sender.create(`${results || "Nie znaleziono takiej frazy"}`);
        });
        if (!page) return;
        let content = await page.intro();
        if (content.length > 2047) content = "Podany tekst jest zbyt długi";
        sender.create(`${content || "Brak"}\n\n[link](${page.fullurl})`);
    }
};



