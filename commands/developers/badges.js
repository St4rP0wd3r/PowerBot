const BaseCommand = require("../../lib/structures/bot/Command");
const resolveBadge = (str) => {
    switch (str) {
        case "bughunter":
            return "<:badge_bughunter:705076975139553330>";
        case "bughunter2":
            return "<:badge_bughunter_lvl2:705076958161010788>";
        case "deserved":
            return "<:badge_hypesquad:778399851918000138>";
        case "moderator":
            return "<a:badge_moderator:844347039919767582>";
        case "staff":
            return "<:badge_staff:705076790644834345>";
        case "developer":
            return "<:badge_developer:705076933645434891>";
        case "premium":
            return "<:badge_nitro:705076842964451418>";
        default:
            return null;
    }
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "badges",
            aliases: ["badge"],
            permissionLevel: 6,
            description: "Zarządza odznakami",
            usage: "<p>badges <add/remove> <user> <badge>",
            category: "Deweloperskie",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);


        switch (args[0]) {
            case "add": {
                const user = await client.functions.getUser(message, args[1]);
                if (!user) return sender.argsError(this.help.usage, prefix, "<user>");

                const userData = await client.database.users.get(user.id);
                const badge = resolveBadge(args[2]);
                if (!badge) return sender.argsError(this.help.usage, prefix, "<badge>");
                userData.badges.push(badge);

                userData.update({
                    badges: userData.badges,
                });
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${user.id}>** (\`${user.tag}\`) dostał odznake ${badge}.`),
                );
                break;
            }

            case "remove": {
                const user = await client.functions.getUser(message, args[1]);
                if (!user) return sender.argsError(this.help.usage, prefix, "<user>");

                const userData = await client.database.users.get(user.id);
                const badge = resolveBadge(args[2]);
                if (!badge) return sender.argsError(this.help.usage, prefix, "<badge>");
                userData.badges.deleteOne(badge);

                userData.update({
                    badges: userData.badges,
                });
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${user.id}>** (\`${user.tag}\`) stracił odznake ${badge}.`),
                );
                break;
            }

            case "reset": {
                const user = await client.functions.getUser(message, args[1]);
                if (!user) return sender.argsError(this.help.usage, prefix, "<user>");

                const userData = await client.database.users.get(user.id);
                userData.update({
                    badges: [],
                });
                await message.reply(new client.Embed(message)
                    .setDescription(`<:check_green:814098229712781313> Użytkownik **<@${user.id}>** (\`${user.tag}\`) nie posiada teraz żadnych odznak.`),
                );
                break;
            }

            case "list": {
                await message.reply(new client.Embed(message)
                    .setDescription("<:check_green:814098229712781313> Lista odznak:\n```yaml\nbughunter\nbughunter2\ndeserved\nmoderator\nstaff\ndeveloper\npremium\```"),
                );
                break;
            }
            default: {
                const embed = new client.Embed(message)
                    .addField("Dodawanie odznaki", `\`${prefix}badge add <user> <badge>\``)
                    .addField("Usuwanie odznaki", `\`${prefix}badge remove <user> <badge>\``)
                    .addField("Resetowanie odznak", `\`${prefix}badge reset <user>\``)
                    .addField("Lista odznak", `\`${prefix}badge list\``);
                return message.reply(embed);
            }
        }
    }

};

