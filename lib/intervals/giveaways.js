const ms = require("../../lib/modules/Ms");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
moment.locale("PL");

const { getWinners } = client.functions;

module.exports = () => {
    setInterval(async () => {
            const all = await client.database.giveaways.interval();
            for (const giveaway of all) {
                const guild = client.guilds.cache.get(giveaway.guildid);
                const channel = client.channels.cache.get(giveaway.channelid);
                if (!guild || !channel) {
                    const embed = new client.Embed()
                        .setAuthor("Giveaway delete (auto)", client.user.displayAvatarURL())
                        .setDescription(`\`\`\`js\n${require("util").inspect(giveaway, { depth: 0 })}\`\`\``)
                        .addField("Serwer", `${guild.name} - ${guild.id}`)
                        .addField("Powód", channel ? "Brak gildi" : "Brak kanału");
                    if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.debug, { embeds: [embed] });
                    await giveaway.remove();
                    continue;
                }
                const msg = await channel.messages.fetch(giveaway.messageid).catch(() => null);
                if (!msg) {
                    const embed = new client.Embed()
                        .setAuthor("Giveaway delete (auto)", client.user.displayAvatarURL())
                        .setDescription(`\`\`\`js\n${require("util").inspect(giveaway, { depth: 0 })}\`\`\``)
                        .addField("Serwer", `${guild.name} - ${guild.id}`)
                        .addField("Powód", "Brak wiadomości");
                    if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.debug, { embeds: [embed] });
                    await giveaway.remove();
                    continue;
                }
                if (giveaway.end <= Date.now()) {
                    const winners = await getWinners(msg, "🎉", giveaway.winners);
                    const formattedWinners = winners?.map(x => `<@${x?.user?.id}>`).join(", ");
                    if (!winners.length) {
                        const embed = new MessageEmbed()
                            .setTitle("🎉 Giveaway zakończony")
                            .setColor("GREEN")
                            .setDescription("Nikt nie wygrał");
                        msg.edit(embed);

                    } else {
                        const embed = new MessageEmbed()
                            .setTitle("🎉 Giveaway zakończony")
                            .setColor("GREEN")
                            .addField("Nagroda", giveaway.prize)
                            .addField("Zwycięzcy", formattedWinners)
                            .addField("Organizator", `<@${giveaway.author}>`);
                        msg.edit(embed);
                    }
                    const embed = new client.Embed()
                        .setAuthor("Giveaway end (auto)", client.user.displayAvatarURL())
                        .setDescription(`\`\`\`js\n${require("util").inspect(giveaway, { depth: 0 })}\`\`\``)
                        .addField("Serwer", `${guild.name} - ${guild.id}`);
                    if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.debug, { embeds: [embed] });
                    channel.send(`[ Wzmianka organizator ] <@${giveaway.author}>`).then(m => m.delete({ timeout: 500 }));
                    giveaway.update({ ended: true });

                } else {
                    const givEmbed = new MessageEmbed()
                        .setTitle("🎉 Giveaway")
                        .setColor("GREEN")
                        .addField("Nagroda", giveaway.prize)
                        .addField("Ilość zwyciezców", giveaway.winners)
                        .setDescription("Zaznacz reakcje 🎉 by dołączyć")
                        .addField("Organizator", `<@${giveaway.author}>`)
                        .addField("Zakończy sie", `${moment(giveaway.end).fromNow()}`)
                        .addField("Data zakończenia", new Date(giveaway.end).toLocaleString());
                    msg.edit(givEmbed);
                }
            }
        }, ms("1m"),
    );
};