const BaseCommand = require("../../lib/structures/bot/Command");

const perms = {
    1: "1: Użytkownik",
    2: "2: Pomocnik",
    3: "3: Moderator",
    4: "4: Administator",
    5: "5: Właściciel serwera",
    6: "6: Programista",
};


module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "help",
            aliases: ["h", "pomoc"],
            description: "Komenda pomocy",
            usage: "<p>help [komenda]",
            category: "Bot",
            args: [{
                name: "komenda",
                description: "Komenda",
                required: false,
                ifFail: "Nie znaleziono takiej komendy",
                check: (args) => !(args[0] && (
                    !client.commands.get(args[0]) &&
                    !client.commands.find((command) => command.conf.aliases.includes(args[0]))
                )),
            }],
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (args[0]) {
            const command = client.commands.get(args[0]) || client.commands.find(x => x.conf.aliases && x.conf.aliases.includes(args[0]));
            if (!command) return sender.error("Nie znaleziono takiej komendy");

            if (command.conf.permissionLevel === 6 && message.member.permissionLevel !== 6) return sender.error(`Nie posiadasz uprawnień do informacji o tej komendzie.\n\nWymagane: **\`${perms[command.conf.permissionLevel]}\`**\nPosiadane: **\`${perms[message.member.permissionLevel]}\`**`);
            const embed = new client.Embed(message)
                .addField("Nazwa", `\`${command.conf.name}\``)
                .addField("Aliases", `${command.conf.aliases.length ? `\`${command.conf.aliases.join(", ")}\`` : "Brak"}`)
                .addField("Opis", `\`${command.help.description}\``)
                .addField("Wyłączona", `\`${command.conf.disabled ? "Tak" : "Nie"}\``)
                .addField("Wymagane uprawnienia:", `\`${perms[command.conf.permissionLevel || 1]}\``)
                .addField("Wymagane uprawnienia bota:", `\`${command.conf.botPerms?.join(", ") || "SEND_MESSAGES"}\``)
                .addField("Kategoria", `\`${command.help.category}\``)
                .addField("Użycie:", `\`${command.help.usage.replace(/<p>/g, prefix)}\``)
                .addField("Flagi", `${command.help.flags || "Brak"}`);
            message.reply(embed);
        } else {
            // const devCommands = client.commands.filter(x => x.help.category === "Deweloperskie" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const adminCommands = client.commands.filter(x => x.help.category === "Administracyjne" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const configCommands = client.commands.filter(x => x.help.category === "Konfiguracyjne" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const funCommands = client.commands.filter(x => x.help.category === "Zabawa" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const toolsCommands = client.commands.filter(x => x.help.category === "Narzędzia" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const giveawayCommands = client.commands.filter(x => x.help.category === "Losowania" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const botsCommands = client.commands.filter(x => x.help.category === "Bot" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const levelsCommands = client.commands.filter(x => x.help.category === "Poziomy" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const animeCommands = client.commands.filter(x => x.help.category === "Anime" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const imgCommands = client.commands.filter(x => x.help.category === "Obrazki" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const gamesCommands = client.commands.filter(x => x.help.category === "Gry" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            //const premiumCommands = client.commands.filter(x => x.help.category === "Premium" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];

            const embed = new client.Embed(message)
                .addField(`<:IconRulesGuidelines:847179755995529226> Komendy podstawowe (\`${botsCommands.length}\`)`, botsCommands.join(", ") || "Brak")
                .addField(`<:IconPrivacy:847179750451839026> Komendy administracyjne (\`${adminCommands.length}\`)`, adminCommands.join(", ") || "Brak")
                .addField(`<:IconSettings:847179759289106462> Komendy konfiguracyjne (\`${configCommands.length}\`)`, configCommands.join(", ") || "Brak")
                .addField(`<:IconScience:847179756743164001> Fun (\`${funCommands.length}\`)`, funCommands.join(", ") || "Brak")
                .addField(`<a:IconTV:847179777466695710> Obrazkowe (\`${imgCommands.length}\`)`, imgCommands.join(", ") || "Brak")
                .addField(`<a:IconWebhooks:847179782328287253> Anime (\`${animeCommands.length}\`)`, animeCommands.join(", ") || "Brak")
                .addField(`<:id:847179783448035339> Narzędzia (\`${toolsCommands.length}\`)`, toolsCommands.join(", ") || "Brak")
                .addField(`<a:IconTrophy:847179776266600468> Giveaway (\`${giveawayCommands.length}\`)`, giveawayCommands.join(", ") || "Brak")
                .addField(`<:IconText:847179766683009034> Poziomy (\`${levelsCommands.length}\`)`, levelsCommands.join(", ") || "Brak")
                .addField(`<:IconGaming:847165370052771912> Gry (\`${gamesCommands.length}\`)`, gamesCommands.join(", ") || "Brak");
            //.addField(`<:IconInteraction:847165394355617822> Premium (\`${premiumCommands.length}\`)`, premiumCommands.join(", ") || "Brak");
            message.reply(embed);
        }

    }
};


