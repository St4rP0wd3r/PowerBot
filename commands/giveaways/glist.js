const BaseCommand = require("../../lib/structures/bot/Command");

const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");

/*
    guildid: guildID,
    messageid: messageID,
    channelid: channelID,
    reaction: reaction,
    ended: ended,
    winners: winners,
    end: end,
    prize: prize,
    author: authorID
*/
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "glist",
            aliases: ["giveawaylist"],
            permissionLevel: 4,
            description: "Lista giveawayów",
            usage: "<p>glist",
            category: "Losowania",
        });
    }

    async run(message) {
        const sender = new client.Sender(message);
        const giveaways = await client.database.giveaways.list(message.guild.id);

        const formatedGiveaways = giveaways.filter(x => x.ended === false).chunk(5);

        if (!formatedGiveaways.length) return sender.error("Na tym serwerze nie ma losowań");
        const embeds = [];
        let int = 0;
        for (const giveawaysList of formatedGiveaways) {
            const embed = new client.Embed(message)
                .setDescription("<:check_green:814098229712781313> **Lista losowań**")
                .setFooter(client.footer, client.user.displayAvatarURL())
                .setAuthor(`${message.author.tag}`, `${message.author.displayAvatarURL(ImageURLOptions)}`)
                .setColor(message.guild.settings?.colors?.done);

            for (const giv of giveawaysList) {
                int++;
                embed.addField(`Giveaway ${int}`, `Nagroda: \`${giv.prize}\`\nLiczba zwycięzców: \`${giv.winners}\`\nData zakończenia: \`${new Date(giv.end).toLocaleString()}\n\`Autor: <@${giv.author}>\nKanał: <#${giv.channelid}>\nID: \`${giv.messageid}\`\nLink: [klik](http://discord.com/channels/${giv.guildid}/${giv.channelid}/${giv.messageid})`);
            }
            embeds.push(embed);
        }

        new ReactionPageMenu({
            message: message,
            channel: message.channel,
            userID: message.author.id,
            pages: embeds,
        });
    }
};

