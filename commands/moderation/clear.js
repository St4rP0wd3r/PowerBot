const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "clear",
            aliases: ["purge", "prune", "wyczysc"],
            permissionLevel: 2,
            botPerms: ["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_MESSAGES"],
            description: "Usuwa podaną ilość wiadomości.",
            usage: "<p>clear <ilość>",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        if (!args.length || isNaN(args[0])) return sender.argsError(this.help.usage, prefix, "<ilość>");
        const toDelCount = parseInt(args[0]);
        if (!toDelCount || toDelCount > 100) return sender.argsError(this.help.usage, prefix, "<ilość>", "Nie można usunać wiecej wiadomości niż 100");

        const btnyID = Math.randomInt(1, 999999999999);
        const btnnID = Math.randomInt(1, 999999999999);

        const btny = new MessageComponent()
            .setID(btnyID)
            .setLabel("Tak")
            .setStyle(3)
            .setEmoji("848851089839095828");

        const btnn = new MessageComponent()
            .setID(btnnID)
            .setStyle(4)
            .setLabel("Nie")
            .setEmoji("848850859341250622");

        const btnlist = new MessageActionRow()
            .addComponents([btny, btnn]);

        const msg = await message.channel.send(null, {
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz usunąć ${toDelCount} wiadomości?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();
        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano usuniecie ${toDelCount} wiadomości`));
                collector.stop();
            }
        });

        setTimeout(() => {
            collector.stop();
            msg.edit(msg.embeds[0]);
        }, 1000 * 60);

        async function done() {
            if (!flags.has("nobtn")) collector.stop();

            message.delete().catch(() => null);
            msg.edit(new client.Embed(message).setDescription("<a:DiscordLoading:824324337603313694> Trwa usuwanie wiadomości..."));

            let msgs = await message.channel.messages.fetch({ limit: toDelCount }).catch(() => null);
            msgs = msgs.filter((m) => m.id !== msg.id);
            if (!msgs.size) return msg.edit(new client.Embed(message).setColor(message.guild.settings.colors.error).setDescription("<:check_red:814098202063405056> Nic nie usunięto").setFooter("Ta wiadomość zniknie za 5 sekund.", client.user.displayAvatarURL(ImageURLOptions))).then(() => msg.delete({ timeout: 5000 }).catch(() => null));


            const deletedMsgs = await message.channel.bulkDelete(msgs)
                .catch(async (err) => {
                    switch (err.code) {
                        case 50034: {
                            return msg.edit(new client.Embed(message)
                                .setColor(message.guild.settings?.colors?.done)
                                .setDescription("Pomyślnie usunięto wiadomości.\n\nNie udało się usunąć pozostałych wiadomości ponieważ nie mogę usuwać wiadomości starszych niż 14 dni. Musisz je usunąć ręcznie.")
                                .setFooter("Ta wiadomość zniknie za 5 sekund.", client.user.displayAvatarURL(ImageURLOptions)),
                            ).then(() => msg.delete({ timeout: 5000 }).catch(() => null));
                        }
                        case 10008: {
                            return msg.edit(new client.Embed(message)
                                .setColor(message.guild.settings?.colors?.done)
                                .setDescription("Pomyślnie usunięto wiadomości.\n\nNiestety nie udało się usunąć wszystkich wiadomośći przez błąd `Nieznana wiadomość.`")
                                .setFooter("Ta wiadomość zniknie za 5 sekund.", client.user.displayAvatarURL(ImageURLOptions)),
                            ).then(() => msg.delete({ timeout: 5000 }).catch(() => null));
                        }
                        default: {
                            return msg.edit(new client.Embed(message)
                                .setColor(message.guild.settings?.colors?.error)
                                .setDescription("Pomyślnie usunięto wiadomości.\n\nNiestety nie udało się usunąć wszystkich wiadomości przez nieznany błąd. Możesz go zgłosić.")
                                .setFooter("Ta wiadomość zniknie za 5 sekund.", client.user.displayAvatarURL(ImageURLOptions)),
                            ).then(() => msg.delete({ timeout: 5000 }).catch(() => null));
                        }
                    }
                });
            if (message.deletable) message.delete().catch(() => null);

            msg.edit(new client.Embed(message)
                .setColor(message.guild.settings?.colors?.done)
                .setDescription(`Pomyślnie usunięto \`${deletedMsgs.size}\`/\`${toDelCount}\``)
                .setFooter("Ta wiadomość zniknie za 5 sekund.", client.user.displayAvatarURL(ImageURLOptions)),
            ).then((msg) => msg.delete({ timeout: 5000 })).catch(() => null);
        }
    }
};

