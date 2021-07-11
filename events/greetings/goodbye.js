const BaseEvent = require("../../lib/structures/bot/Event");
const { MessageEmbed } = require("discord.js-light");
module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "goodbye",
            discord: "guildMemberRemove",
        });
    }

    async run(member) {
        await member.fetch().catch(() => null);

        const replaceVars = (str) => str
            .replace(/{guild}/g, member.guild.name)
            .replace(/{guild.members}/g, member.guild.memberCount)
            .replace(/{guild.id}/g, member.guild.id)
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{user.username}/g, member.user.username)
            .replace(/{user.tag}/g, member.user.tag)
            .replace(/{user.id}/g, member.user.id);


        const guildConf = await client.database.servers.get(member.guild.id);
        if (!guildConf.goodbye?.status) return;
        const embed = new MessageEmbed()
            .setTitle(replaceVars(guildConf.goodbye.title || ""))
            .setColor(guildConf.goodbye.color)
            .setDescription(replaceVars(guildConf.goodbye.message) || "")
            .setThumbnail(member.user.displayAvatarURL(ImageURLOptions));
        const ch = client.channels.cache.get(guildConf.goodbye.channel);
        if (ch) ch.send(embed);
    }
};