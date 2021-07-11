const ms = require("../../lib/modules/Ms");

module.exports = () => {
    setInterval(async () => {
            const all = await client.database.reminders.interval();
            for (const remind of all) {
                const user = await client.users.fetch(remind.userid);
                const embed = new client.Embed()
                    .setTitle("🔔 Przypomnienie")
                    .setDescription(remind.text);
                for (let i = 0; i < 4; i++) user.send("[ Wzmianka przypomnienia ]").then(x => x.delete({ timeout: 500 })).catch(() => null);
                user?.send(embed).catch(() => null);

                remind.remove();
            }
        },
        ms("1m"),
    );
};