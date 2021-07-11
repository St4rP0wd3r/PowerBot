const BaseCommand = require("../../lib/structures/bot/Command");
const moment = require("moment");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "premium-reedem",
            aliases: ["odbierz-premium", "preedem", "pr"],
            description: "Odbiera premium",
            usage: "<p>reedem <kod>",
            category: "Premium",
            flags: null,
            permissionLevel: 1,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);

        const code = args[0];

        if (!code) return sender.argsError(this.help.usage, prefix, "<kod>");

        const premium = await client.database.premium.get(code);

        if (!premium || premium.reedemed) return sender.argsError(this.help.usage, prefix, "<kod>", "Podano niepoprawny lub odebrany kod");

        const userData = await client.database.users.get(message.author.id);

        if (userData.premium?.status) return sender.error("Posiadasz już premium!");

        sender.create(`Ten kod premium został przypisany do twojego konta!\nCzas zakończenia: ${premium.end ? moment(premium.end).format("LLLL") : "Brak"} ${premium.end ? `(${moment(premium.end).fromNow()})` : ""}`);
        const time = premium.end;
        message.author.send(new client.Embed().setDescription(`Twój pakiet premium został rozpoczęty.\nCzas zakończenia: ${time === 0 ? "Brak" : new Date(time).toLocaleString()}`,
        ));

        premium.update({
            reedemed: true,
            user: message.author.id,
        });
        if (!userData.badges.includes("<:badge_nitro:705076842964451418>")) userData.badges.push("<:badge_nitro:705076842964451418>");
        if (userData.premium.servers) userData.premium.servers.forEach(async x => {
            const guildData = await client.database.servers.get(x);

            guildData.premium = {
                id: premium.id,
                status: true,
            };

            guildData.update({
                premium: guildData.premium,
            });
        });
        userData.update({
            premium: { status: true, id: premium.id },
            badges: userData.badges,
        });
    }
};