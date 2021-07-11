const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "leveling",
        });
    }

    async run(message, { guildConf }) {
        //const sender = new client.Sender(message);

        const userData = await client.database.leveling.get(message.guild.id, message.author.id);
        const random = Math.floor(Math.random() * 7) + 5;

        await userData.update({
            xp: userData?.xp + random,
        });

        const replaceVAriables = (str) => str
            .replace(/{guild}/g, message.guild.name)
            .replace(/{guild.members}/g, message.guild.memberCount)
            .replace(/{guild.id}/g, message.guild.id)
            .replace(/{user}/g, `<@${message.author.id}>`)
            .replace(/{user.username}/g, message.author.username)
            .replace(/{user.tag}/g, message.author.tag)
            .replace(/{user.id}/g, message.author.id)
            .replace(/{level}/g, userData.level + 1)
            .replace(/{xp}/g, userData?.xp + random);

        if (Array.isArray(guildConf.leveling.roles)) {
            const filtred = guildConf.leveling.roles.filter(x => x.level <= userData.level);
            for (const role of filtred) await message.member.roles.add(role.roleid).catch(() => null);
        }

        const xpNeeded = (userData.level === 0 ? 150 : guildConf.leveling.xpNeeded * userData.level);
        if (xpNeeded < userData.xp) {
            await userData.update({
                xp: userData.xp - xpNeeded,
                level: userData.level + 1,
            });
            if (guildConf.leveling.message.embed) message.reply(new client.Embed(message).setDescription(replaceVAriables(guildConf.leveling.message.text)));
            else message.reply(replaceVAriables(guildConf.leveling.message.text));
        }

    }


};