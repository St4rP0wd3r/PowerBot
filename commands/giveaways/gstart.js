const BaseCommand = require("../../lib/structures/bot/Command");

const Ms = require("../../lib/modules/Ms");
const moment = require("moment");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "gstart",
            aliases: ["wystartujlosowanie", "giveawaystart"],
            permissionLevel: 4,
            description: "Tworzy giveaway",
            usage: "<p>gstart [kanał] <ilość zwyciezców> <czas> <nagroda>",
            category: "Losowania",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const channel = message.mentions.channels.first() || message.channel;
        if (channel.id !== message.channel.id || args[0]?.includes("<#")) await args.shift();
        if (channel.guild.id !== message.guild.id) return sender.argsError(this.help.usage, prefix, "[kanał]", "Bot musi mieć permisje do tego kanału");
        if (!channel.permissionsFor(client.user).toArray().includes("SEND_MESSAGES")) return sender.argsError(this.help.usage, prefix, "[kanał]", "Bot musi mieć permisje do tego kanału");
        const winnersSize = args[0];
        if (!winnersSize || !parseInt(winnersSize)) return sender.argsError(this.help.usage, prefix, "<ilość zwyciezców>");
        const time = Ms(args[1]) ? Ms(args[1]) + Date.now() : Date.parse(args[1].replace("_", " "));
        if (!time) return sender.argsError(this.help.usage, prefix, "<czas>");
        const prize = args.slice(2).join(" ");
        if (!prize) return sender.argsError(this.help.usage, prefix, "<nagroda>");
        if (prize.length > 1028) return sender.argsError(this.help.usage, prefix, "<nagroda>", "Nagroda musi być mniejsza niż 1028 znaków");

        const givEmbed = new client.Embed()
            .setTitle("🎉 Giveaway")
            .setColor(message.guild.settings?.colors?.done)
            .addField("Nagroda", prize)
            .addField("Ilość zwyciezców", winnersSize)
            .setDescription("Zaznacz reakcje 🎉 by dołączyć")
            .addField("Organizator", `${message.author}`)
            .addField("Zakończy sie", `${moment(time).fromNow()}`)
            .addField("Data zakończenia", new Date(time).toLocaleString());

        const msg = await channel.send(givEmbed);
        const giveaway = await client.database.giveaways.create({
            guildID: message.guild.id,
            messageID: msg.id,
            channelID: msg.channel.id,
            authorID: message.author.id,
            reaction: "🎉",
            end: time,
            prize,
            winners: parseInt(winnersSize),
        });
        sender.create(`Stworzono giveaway na kanale <#${channel.id}>`, "🎉 Giveaway");
        await msg.react("🎉");
        const embed = new client.Embed(message)
            .setAuthor("Giveaways start", client.user.displayAvatarURL())
            .setDescription(`\`\`\`js\n${require("util").inspect(giveaway, { depth: 0 })}\`\`\``)
            .addField("Użytkownik", `${message.author.tag} - ${message.author.id}`)
            .addField("Serwer", `${message.guild.name} - ${message.guild.id}`)
            .addField("Treść wiadomosci", message.content.length < 1023 ? message.content : "Zbyt duża");
        if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.debug, { embeds: [embed] });
    }
};

