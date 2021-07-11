const BaseCommand = require("../../lib/structures/bot/Command");
const moment = require("moment");
moment.locale("PL");
const Ms = require("../../lib/modules/Ms");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "premium",
            permissionLevel: 6,
            description: "Nadaje premium",
            usage: "<p>premium <add/remove/gen> [Użytkownik]",
            category: "Deweloperskie",
        });
    }

    async run(message, { args, prefix, flags }) {
        const sender = new client.Sender(message);
        switch (args[0]?.toLowerCase()) {
            case "add": {
                const user = await client.functions.getUser(message, args[1]);
                if (!user) return sender.error("Nie znaleziono użytkownika");
                const time = (args[2] || "lifetime") === "lifetime" ? 0 : Ms(args[2]) ? Ms(args[2]) + Date.now() : Date.parse(args[2]?.replace("_", " "));
                if (typeof time !== "number") return sender.error("Podaj własciwy czas");
                const userData = await client.database.users.get(user.id);
                if (userData.premium.status) return sender.error("Ta osoba ma premium");
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${user.id}>** (\`${user.tag}\`) dostał premium.`),
                );
                user.send(new client.Embed().setDescription(`Twój pakiet premium został rozpoczęty.\nCzas zakończenia: ${time ? moment(time).format("LLLL") : "Brak"} ${time ? `(${moment(time).fromNow()})` : ""}`));
                if (!userData.badges.includes("<:badge_nitro:705076842964451418>")) userData.badges.push("<:badge_nitro:705076842964451418>");

                const { id } = await client.database.premium.add({
                    user: user.id,
                    reedemed: true,
                    time,
                });

                if (userData.premium.servers) userData.premium.servers.forEach(async x => {
                    const guildData = await client.database.servers.get(x);

                    guildData.premium = {
                        id: id,
                        status: true,
                    };

                    guildData.update({
                        premium: guildData.premium,
                    });
                });
                userData.update({ badges: userData.badges, premium: { id, status: true } });


                break;
            }
            case "remove": {
                const user = await client.functions.getUser(message, args[1]);
                if (!user) return sender.error("Nie znaleziono użytkownika");
                const userData = await client.database.users.get(user.id);
                if (!userData.premium.status) return sender.error("Ta osoba nie ma premium");
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${user.id}>** (\`${user.tag}\`) stracił premium.`),
                );
                if (userData.badges.includes("<:badge_nitro:705076842964451418>")) userData.badges.deleteOne("<:badge_nitro:705076842964451418>");
                user.send(new client.Embed().setDescription(`Twój pakiet premium został zakończony`));
                const premium = await client.database.premium.get(userData.premium.id);
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
                break;
            }

            case "gen": {
                const time = (args[1] || "lifetime") === "lifetime" ? 0 : Ms(args[1]) ? Ms(args[1]) + Date.now() : Date.parse(args[1]?.replace("_", " "));
                if (!time) return sender.error("Podaj własciwy czas");
                const { id } = await client.database.premium.add({
                    user: null,
                    time,
                });
                const msg = await sender.create("Wysyłam kod na dm...");
                await message.member.send(new client.Embed(message).setDescription(`Kod premium: \`${id}\``));
                msg.edit(new client.Embed(msg).setDescription("Wysłano kod premium na dm"));
                break;
            }
            default:
                sender.argsError(this.help.usage, prefix, "<add/remove/list>");
        }
    }
};

