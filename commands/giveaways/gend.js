const BaseCommand = require("../../lib/structures/bot/Command");

const { getWinners } = client.functions;

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "gend",
            aliases: ["zakonczlosowanie"],
            permissionLevel: 4,
            description: "Konczy giveaway",
            usage: "<p>gend <ID>",
            category: "Losowania",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args[0]) return sender.argsError(this.help.usage, prefix, "<ID>");
        const giveaway = await client.database.giveaways.get(message.guild.id, args[0]);
        if (!giveaway) return sender.argsError(this.help.usage, prefix, "<ID>", "Podaj id wiadomości z giveawayem");
        if (giveaway.ended) return sender.argsError(this.help.usage, prefix, "<ID>", "Podaj niezakończony giveaway");

        const channel = client.channels.cache.get(giveaway.channelid);
        if (!channel) return sender.argsError(this.help.usage, prefix, "<ID>");
        const msg = await channel.messages.fetch(giveaway.messageid);
        if (!msg) return sender.argsError(this.help.usage, prefix, "<ID>");
        const winners = await getWinners(msg, "🎉", giveaway.winners);
        const formattedWinners = winners.map(x => `<@${x.user.id}>`).join(", ");
        if (!winners.length) {
            const embed = new client.Embed()
                .setTitle("🎉 Giveaway zakończony")
                .setColor(message.guild.settings?.colors?.done)
                .setDescription("Nikt nie wygrał");
            msg.edit(embed);
            //await inlineReply(msg, `> Giveaway zakończony\nNikt nie wygrał`)

        } else {
            const embed = new client.Embed()
                .setTitle("🎉 Giveaway zakończony")
                .setColor(message.guild.settings?.colors?.done)
                .addField("Nagroda", giveaway.prize)
                .addField("Zwycięzcy", formattedWinners)
                .addField("Organizator", `<@${giveaway.author}>`);
            msg.edit(embed);
            //await inlineReply(msg, `> Giveaway zakończony\nWygrani: ${formattedWinners}`)
            //channel.send(`[ Wzmianka wygranych ] ${formattedWinners}`).then(m => m.delete({timeout: 500}));
        }
        channel.send(`[ Wzmianka organizator ] <@${giveaway.author}>`).then(m => m.delete({ timeout: 500 }));
        giveaway.update({ ended: true });


        await sender.create(`Zakończono giveaway na kanale <#${giveaway.channelid}>`, "Poczekaj minute na zakończenie giveawaya");

        const embed = new client.Embed(message)
            .setAuthor("Giveaways end", client.user.displayAvatarURL())
            .setDescription(`\`\`\`js\n${require("util").inspect(giveaway, { depth: 0 })}\`\`\``)
            .addField("Użytkownik", `${message.author.tag} - ${message.author.id}`)
            .addField("Serwer", `${message.guild.name} - ${message.guild.id}`)
            .addField("Treść wiadomosci", message.content.length < 1023 ? message.content : "Zbyt duża");
        if (client.config.settings.node === "production") client.functions.postWebhook(client.config.webhooks.debug, { embeds: [embed] });
    }
};

