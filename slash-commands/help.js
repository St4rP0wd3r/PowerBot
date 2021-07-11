const BaseCommand = require("../lib/structures/slash-commands/Command");

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
            data: {
                name: "help",
                description: "Pokazuje informacje dot. komendy lub liste komend",
                options: [{
                    type: 3,
                    name: "command",
                    required: false,
                    description: "Pokazuje informacje dot. komendy",
                }],
            },
        });
    }

    async run(interaction) {
        const settings = await client.database.servers.get(interaction.guild_id);
        const author = await client.users.fetch(interaction.member.user.id);
        if (interaction.data.options?.length) {
            const arg = interaction.data.options[0]?.value;
            const command = client.commands.get(arg) || client.commands.find(x => x.conf.aliases && x.conf.aliases.includes(arg));
            if (!command) {
                const embed = new client.Embed({ settings, author })
                    .setDescription("Nie znaleziono takiej komendy")
                    .setColor(settings.colors.error);
                interaction.reply(embed);
                return;
            }

            const embed = new client.Embed({ settings, author })
                .setColor(settings?.colors?.done)
                .addField("Nazwa", `\`${command.conf.name}\``)
                .addField("Aliases", `${command.conf.aliases.length ? `\`${command.conf.aliases.join(", ")}\`` : "Brak"}`)
                .addField("Opis", `\`${command.help.description}\``)
                .addField("Wyłączona", `\`${command.conf.disabled ? "Tak" : "Nie"}\``)
                .addField("Wymagane uprawnienia:", `\`${perms[command.conf.permissionLevel || 1]}\``)
                .addField("Wymagane uprawnienia bota:", `\`${command.conf.botPerm || "SEND_MESSAGES"}\``)
                .addField("Kategoria", `\`${command.help.category}\``)
                .addField("Użycie:", `\`${command.help.usage.replace(/<p>/g, settings.prefixes[0])}\``)
                .addField("Flagi", `${command.help.flags || "Brak"}`);
            interaction.reply(embed);

        } else {
            const adminCommands = client.commands.filter(x => x.help.category === "Administracyjne" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const configCommands = client.commands.filter(x => x.help.category === "Konfiguracyjne" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const funCommands = client.commands.filter(x => x.help.category === "Zabawa" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const toolsCommands = client.commands.filter(x => x.help.category === "Narzędzia" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const giveawayCommands = client.commands.filter(x => x.help.category === "Losowania" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const botsCommands = client.commands.filter(x => x.help.category === "Bot" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const levelsCommands = client.commands.filter(x => x.help.category === "Poziomy" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const animeCommands = client.commands.filter(x => x.help.category === "Anime" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];
            const imgCommands = client.commands.filter(x => x.help.category === "Obrazki" && !x.conf.disabled).map(x => `\`${x.conf.name}\``) || [];

            const embed = new client.Embed({ settings, author })
                .addField(`Komendy podstawowe (\`${botsCommands.length}\`)`, botsCommands.join(", ") || "Brak")
                .addField(`Komendy administracyjne (\`${adminCommands.length}\`)`, adminCommands.join(", ") || "Brak")
                .addField(`Komendy konfiguracyjne (\`${configCommands.length}\`)`, configCommands.join(", ") || "Brak")
                .addField(`Fun (\`${funCommands.length}\`)`, funCommands.join(", ") || "Brak")
                .addField(`Obrazkowe (\`${imgCommands.length}\`)`, imgCommands.join(", ") || "Brak")
                .addField(`Anime (\`${animeCommands.length}\`)`, animeCommands.join(", ") || "Brak")
                .addField(`Narzędzia (\`${toolsCommands.length}\`)`, toolsCommands.join(", ") || "Brak")
                .addField(`Giveaway (\`${giveawayCommands.length}\`)`, giveawayCommands.join(", ") || "Brak")
                .addField(`Poziomy (\`${levelsCommands.length}\`)`, levelsCommands.join(", ") || "Brak");
            interaction.reply(embed);
        }
    }
};