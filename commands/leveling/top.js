const BaseCommand = require("../../lib/structures/bot/Command");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "top",
            description: "Pokazuje topke poziomów",
            usage: "<p>top",
            category: "Poziomy",
        });
    }

    async run(message, { guildConf }) {
        const sender = new client.Sender(message);
        if (!guildConf.leveling?.status) return sender.error("System poziomów jest wyłączony!");

        const top = await client.database.leveling.getAll(message.guild.id);
        message.channel.startTyping(1);
        if (!top.length) return sender.error("Na tym serwerze nie ma topki!");
        const embeds = [];
        const formatedTop = top.chunk(10);
        let int = 0;
        for (const smallTop of formatedTop) {
            let text = "";
            const embed = new client.Embed(message)
                .setTitle("Top poziomów")
                .setColor("GREEN");
            for (const user of smallTop) {
                int++;
                text += `\`${int}.\` <@${user.userid}> \`${user.level}\`\ (\`${user.xp}\` \\ \`${(user.level === 0 ? 150 : (guildConf.leveling.xpNeeded * user.level))}\`)\n\n`;
            }
            embed.setDescription(text);
            embeds.push(embed);
        }

        new ReactionPageMenu({
            channel: message.channel,
            userID: message.author.id,
            pages: embeds,
            message: message,
        });
        message.channel.stopTyping(1);

    }
};

