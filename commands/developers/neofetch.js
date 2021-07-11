const BaseCommand = require("../../lib/structures/bot/Command");
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "neofetch",
            aliases: [],
            description: "neofetch",
            usage: "<p>neofetch",
            category: "Deweloperskie",
            permissionLevel: 6,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const { execSync } = require("child_process");
        message.reply(new client.Embed(message).setDescription("```yaml\n" + execSync("neofetch").toString().split(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ \-\/]*[@-~])/g).join("") + "```", { code: "yaml" }));
    }
};