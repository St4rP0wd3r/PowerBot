const ms = require("../../lib/modules/Ms");

module.exports = () => {
    setInterval(async () => {
            const all = await client.database.tempbans.interval();
            for (const tempban of all) {
                const guild = client.guilds.cache.get(tempban.guildid);
                const guildConf = await client.database.servers.get(guild.id);
                const user = await client.users.fetch(tempban.userid).catch(() => null);
                const reason = "Automatyczne odbanowanie";
                const { caseid } = await client.database.punishments.create(guild.id, tempban.userid, {
                    moderator: client.user.id,
                    date: { created: Date.now(), expires: null },
                    reason: reason,
                    hide: [],
                    type: "unban",
                });

                await tempban.remove();

                await user?.send(new client.Embed()
                    .setColor("GREEN")
                    .setTitle("Unban")
                    .addField("**Serwer:**", guild.name)
                    .addField("**Moderator:**", client.user)
                    .addField("**Powód:**", reason)
                    .addField("**Case ID:**", "#" + caseid),
                ).catch(() => null);

                if (!guildConf.modlog.status) continue;
                const embed = new client.Embed()
                    .setAuthor(`${client.user.tag}`, client.user.displayAvatarURL({ dynamic: true }))
                    .addField("**»** Użytkownik", `> <@!${target.id}> (\`${target.tag}\`)`)
                    .addField("**»** Powód", "> " + reason)
                    .addField("**»** Akcja", "> Koniec tempbana.")
                    .setColor(guildConf.colors.done)
                    .addField("**»** Punishment", `> #${caseid}`);
                guild.channels.cache.get(guildConf.modlog.channel)?.send(embed);
            }
        }, 20000,
    );
};