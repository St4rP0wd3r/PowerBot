const BaseCommand = require("../../lib/structures/bot/Command");
const { execSync } = require("child_process");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "shell",
            permissionLevel: 6,
            description: "Wykonuje komende w konsoli",
            usage: "<p>shell <komenda>",
            category: "Deweloperskie",
        });
    }

    async run(message, { args }) {
        let query = args.join(" ") || "null";
        let data;
        try {
            data = await execSync(query);
        } catch (err) {
            if (query.length > 1012) query = query.substring(0, 1010) + "...";
            if (err.toString().length > 1012) err = err.toString().substring(0, 1010) + "...";
            const embederror = new client.Embed(message)
                .setDescription(`<:check_red:814098202063405056> **Error**`)
                .addField("Input", `\`\`\`yaml\n${query}\`\`\``)
                .addField("Output", `\`\`\`yaml\n${err || "null"}\`\`\``)
                .setColor(message.guild.settings.colors.error);
            return message.reply(embederror);
        }
        if (query.length > 1012) query = query.substring(0, 1010) + "...";
        if (data.toString().length > 1012) data = data.toString().substring(0, 1010) + "...";
        data = data.toString();
        const embed = new client.Embed(message)
            .setDescription("<:check_green:814098229712781313> **Shell**")
            .addField("Input", `\`\`\`yaml\n${query}\`\`\``)
            .addField("Output", `\`\`\`yaml\n${data || "null"}\`\`\``);
        message.reply(embed);
    }
};

