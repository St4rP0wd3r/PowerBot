const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "reboot",
            aliases: ["rb"],
            permissionLevel: 6,
            description: "Restartuje bota",
            usage: "<p>reboot",
            category: "Deweloperskie",
        });
    }

    async run() {
        process.exit(0);
    }

};

