const BaseCommand = require("../../lib/structures/bot/Command");
const { execSync } = require("child_process");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "update",
            permissionLevel: 6,
            description: "Updatuje bota",
            usage: "<p>update",
            category: "Deweloperskie",
        });
    }

    async run(message) {
        const sender = new client.Sender(message);
        let out;
        try {
            out = await execSync("git fetch && git pull");
        } catch (err) {
            return sender.error(`\`\`\`yaml\n${err.stack}\`\`\``);
        }
        if (out.includes("Already up to date.")) return sender.error("Nie pojawiły sie żadne aktualizacje!");
        sender.create(`Zaktualizowano:\n\`\`\`\n${out}\`\`\``);
    }

};

