const { MessageAttachment } = require("discord.js-light");
const BaseCommand = require("../../lib/structures/bot/Command");
const canvacord = require("canvacord");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "rank",
            description: "Sprawdza poziom użytkownika",
            usage: "<p>rank <user>",
            category: "Poziomy",
        });
    }

    async run(message, { args, guildConf }) {
        const sender = new client.Sender(message);
        if (!guildConf.leveling?.status) return sender.error("System poziomów jest wyłączony!");
        const member = await client.functions.getUser(message, args[0]) || message.author;
        if (member.bot) return sender.error("Nie możesz sprawdzić poziomu bota, bo go nie ma. No kto by sie spodziewał?");

        const userData = await client.database.leveling.get(message.guild.id, member.id);
        const rankData = await client.database.leveling.getAll(message.guild.id);
        const ranks = rankData.find(n => n.userid === member.id);

        const rank = new canvacord.Rank()
            .setAvatar(member.displayAvatarURL({ format: "jpg" }))
            .setCurrentXP(userData.xp ? userData.xp : 0)
            .setRequiredXP(userData.level === 0 ? 150 : (guildConf.leveling.xpNeeded * userData.level))
            .setLevel(userData.level ? userData.level : 0)
            .setStatus(member.presence.status)
            .setProgressBar("BLUE")
            .setUsername(member.username)
            .setDiscriminator(member.discriminator)
            .setBackground("IMAGE", "https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/da3c529f-15c4-4152-8a43-2b401fd93124.jpg")
            .setRank(rankData.indexOf(ranks) + 1);
        message.channel.startTyping(1);
        const data = await rank.build();
        message.channel.stopTyping(1);
        const attachment = new MessageAttachment(data, "rank.png");
        const embed = new client.Embed(message)
            .attachFiles(attachment)
            .setImage("attachment://rank.png");

        message.reply(embed);

    }
};

