const BaseCommand = require("../../lib/structures/bot/Command");
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "afk",
            aliases: ["niemamnie"],
            description: "Robi cie afk",
            usage: "<p>afk <powód>",
            category: "Narzędzia",
            cooldown: 15,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        if (message.author.userData.afk.status) {
            message.reply(new client.Embed(message).setDescription("<:r_afk:853926255040135168> Nie jesteś już AFK"));
            message.author.userData.update({
                afk: {
                    status: false,
                    reason: null,
                },
            });
        } else {
            message.reply(new client.Embed(message).setDescription(`<:r_afk:853926255040135168> Jesteś teraz AFK.\nPowód: ${args.join(" ") || "Nie podano"}`));

            message.author.userData.update({
                afk: {
                    status: true,
                    reason: args.join(" ") || "Nie podano",
                },
            });
        }
    }
};
