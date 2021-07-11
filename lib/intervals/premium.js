const moment = require("moment");
moment.locale("PL");

module.exports = () => {
    setInterval(async () => {
        const all = await client.database.premium.interval();
        for (const premium of all) {
            if (!premium.user) continue;
            const user = await client.users.fetch(premium.user);
            user.send(new client.Embed().setDescription(`Twój pakiet premium został zakończony`));
            premium.remove();
            const userData = await client.database.users.get(user.id);
            if (userData.badges.includes("<:badge_nitro:705076842964451418>")) userData.badges.deleteOne("<:badge_nitro:705076842964451418>");

            if (userData.premium.servers) userData.premium.servers.forEach(async g => {
                const guildData = await client.database.servers.get(g);

                guildData.premium = {
                    id: null,
                    status: false,
                };

                guildData.update({
                    premium: guildData.premium,
                });
            });

            userData.update({ badges: userData.badges, premium: { status: false, id: null } });

            premium.remove();
        }
    }, 60 * 1000);
};