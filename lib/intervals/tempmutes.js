const ms = require("../../lib/modules/Ms");

module.exports = () => {
    setInterval(async () => {
            const all = await client.database.tempmutes.interval();
            for (const tempban of all) {
                const mute = await client.database.mutes.get(tempban.guildid, tempban.userid);
                const guild = client.guilds.cache.get(tempban.guildid);
                const guildConf = await client.database.servers.get(guild.id);
                const reason = "Automatyczne odciszenie";
                const user = await client.users.fetch(tempban.userid).catch(() => null);
                const member = await guild.members.fetch(tempban.userid).catch(() => null);
                const { caseid } = await client.database.punishments.create(tempban.guildid, tempban.userid, {
                    moderator: client.user.id,
                    date: { created: Date.now(), expires: null },
                    reason: reason,
                    hide: [],
                    type: "unmute",
                });
                if (member) member?.roles?.remove(guildConf.mutedRole).catch(() => null);
                await tempban.remove();
                if (mute) await mute.remove();

                await user?.send(new client.Embed()
                    .setColor("GREEN")
                    .setTitle("Unmute")
                    .addField("**Serwer:**", guild.name)
                    .addField("**Moderator:**", client.user)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => null);

                if (!guildConf.modlog.status) continue;
                const embed = new client.Embed()
                    .setAuthor(`${client.user.tag}`, client.user.displayAvatarURL({ dynamic: true }))
                    .addField("**»** Użytkownik", `> <@!${user.id}> (\`${user.tag}\`)`)
                    .addField("**»** Powód", "> " + reason)
                    .addField("**»** Akcja", "> Koniec tempmuta.")
                    .setColor(guildConf.colors.done)
                    .addField("**»** Punishment", `> #${caseid}`);
                guild.channels.cache.get(guildConf.modlog.channel)?.send(embed);
            }
        },
        ms("1m"),
    );
};