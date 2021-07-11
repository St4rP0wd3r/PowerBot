const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "token",
            aliases: ["bottoken", "bot-token"],
            description: "Wysyła randomowy token bota.",
            usage: "<p>token",
            category: "Zabawa",
        });
    }

    async run(message) {
        const data = await client.functions.getJsonFromApi("https://some-random-api.ml/bottoken");
        const sender = new client.Sender(message);
        sender.create(`Wygenerowany token:\n\`\`\`yaml\n${data.token}\`\`\``);
    }
};

