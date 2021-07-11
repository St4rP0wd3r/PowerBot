const BaseEvent = require("../../lib/structures/bot/Event");
const { Collection } = require("discord.js-light");
const cooldowns = new Collection();

const replaceComment = content => content.replace(/@&/g, "@&\u200b").replace(/@here/g, "@here\u200b").replace(/@everyone/g, "@everyone\u200b");


module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "proposalCreate",
        });
    }

    async run(message, { guildConf }) {
        const sender = new client.Sender(message);
        if (!message.guild.webhook) return sender.error("Bot nie posiada tu webhooka. Może to być spowodowane brakiem uprawnień lub błędem z naszej strony");

        if (message.member.permissionLevel !== 6) {
            const cooldownAmount = 2 * 1000;

            if (cooldowns.has(message.author.id)) {
                const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

                if (Date.now() < expirationTime) {
                    const timeLeft = (expirationTime - Date.now()) / 1000;
                    const x = await sender.create(`Poczekaj \`${timeLeft.toFixed(1)}s\` przed napisaniem kolejnej propozycji`);
                    await x.delete({ timeout: 5000 }).catch(() => {
                    });
                    await message.delete({ timeout: 5000 }).catch(() => {
                    });
                    return;
                }
            }

            cooldowns.set(message.author.id, Date.now());
            setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
        }
        const nick = message.member.nickname || message.author.username;
        await message.guild.webhook.setChannel(message.channel);
        if (message.content.startsWith(guildConf.proposals.comment)) {
            const content = message.content.replace(guildConf.proposals.comment, "");
            await message.guild.webhook.send(replaceComment(content), {
                files: message.attachments.map(a => a.url),
                username: nick,
                avatarURL: message.author.displayAvatarURL(),
                disableMentions: "everyone",
            });
            message.delete({ timeout: 500 }).catch(() => null);
        } else {
            const embed = new client.Embed()
                .setDescription(`${message.content}`)
                .setFooter(`Komentarz: ${guildConf.proposals.comment}<treść>`);
            if (message.attachments.size > 0) embed.setImage(message.attachments.array()[0].proxyURL);
            const msg = await message.guild.webhook.send({
                embeds: [embed],
                username: nick,
                avatarURL: message.author.displayAvatarURL(),
                disableMentions: "all",
            });
            await message.delete({ timeout: 500 }).catch(() => null);
            await msg.react("814098229712781313");
            await msg.react("814098094743486468");
            await msg.react("814098202063405056");
        }
    }


};