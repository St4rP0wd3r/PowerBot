const BaseCommand = require("../../lib/structures/bot/Command");
module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "broadcast",
            aliases: ["br"],
            description: "Tworzy ogłoszenie",
            usage: "<p>broadcast <tekst>",
            category: "Administracyjne",
            args: [{
                name: "tekst",
                required: true,
                description: "Tekst",
                ifFail: "Nie podano tekstu",
                check: (args) => {
                    return args[0];
                },
            }],
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);
        const channel = guildConf.broadcast.channel ? message.guild.channels.cache.get(guildConf.broadcast.channel) : message.channel;

        if (!channel) return sender.error("Nie znaleziono kanału ogłoszeń. Ustaw go w panelu lub komendą `config`");
        const embed = new client.Embed(message).setDescription(args.join(" ")).setTitle("Ogłoszenie");
        if (message.attachments.array()[0]) embed.setImage(message.attachments.array()[0].url);
        channel.send(embed);
        if (channel.id !== message.channel.id) return sender.create(`Wysłano ogłoszenie na kanale ${channel}`);
    }
};