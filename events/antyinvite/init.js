const BaseEvent = require("../../lib/structures/bot/Event");

module.exports = class Event extends BaseEvent {
    constructor() {
        super({
            name: "antyinviteInit",
        });
    }

    async run(message) {
        if (message.member.permissionLevel >= 4) return true;
        if (message.partial) await message.fetch().catch(() => null);
        if (!message.author) return;
        if (message.author.partial) await message.author.fetch().catch(() => null);

        const regex = /(discord.com\/invite|s?:\/\/discord.gg\/)|discord(?:app.com\/invite|.gg)/g;

        if (regex.test(message.content)) {
            message.delete({ timeout: 500 });
            const embed = new client.Embed(message)
                .setDescription(`<:check_red:814098202063405056> **Próba reklamy**!\n\nUżytkownik <@${message.author.id}> (\`${message.author.id}\`) napisał odnośnik do discorda.`)
                .setColor(message.guild.settings.colors.error);
            message.channel.send(embed);
            return false;
        } else return true;


    }
};