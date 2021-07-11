const BaseEvent = require("../../lib/structures/bot/Event");
module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "antyinviteEdit",
            discord: "messageUpdate",
        });
    }

    async run(oldMessage, message) {
        if (!oldMessage || !message) return;
        if (message.partial) await message.fetch().catch(() => null);

        if (!message.author || !message.member) return;
        if (oldMessage.partial) await oldMessage.fetch().catch(() => null);
        if (message.author.partial) await message.author.fetch().catch(() => null);
        if (message.member.partial) await message.member.fetch().catch(() => null);

        const guildConf = await client.database.servers.get(message.guild.id);
        if (guildConf.antyinvite?.status && !message.member.roles.cache.some(x => guildConf.antyinvite.roles.includes(x)) && !guildConf.antyinvite.channels.includes(message.channel.id) && !guildConf.antyinvite.users.includes(message.author.id)) {
            const perms = await client.functions.getUserPerms(message);
            if (perms >= 4) return;
            const regex = /(discord.com\/invite|s?:\/\/discord.gg\/)|discord(?:app.com\/invite|.gg)/g;

            if (regex.test(message.content)) {
                message.delete({ timeout: 500 });
                const embed = new client.Embed(message)
                    .setDescription(`<:check_red:814098202063405056> **Próba reklamy**!\n\nUżytkownik <@${message.author.id}> (\`${message.author.id}\`) napisał odnośnik do discorda.`)
                    .setColor(guildConf.colors.error);
                message.channel.send(embed);
            }
        }
    }
};