const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "reason",
            permissionLevel: 4,
            description: "Zmienia powod punishmenta",
            usage: "<p>reason <ID> <powód>",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const number = args[0];

        if (!number || !parseInt(number)) return sender.argsError(this.help.usage, prefix, "<ID>");

        const reason = args.slice(1).join(" ");

        if (!reason) return sender.argsError(this.help.usage, prefix, "<reason>");

        const punish = await client.database.punishments.get(message.guild.id, number);

        if (!punish) return sender.argsError(this.help.usage, prefix, "<ID>", "Musisz podać poprawne ID");

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

        const msg = await message.reply(null, {
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz zmienić powód punishmenta o id ${number}?`),
            components: btnlist,
        });
        if (flags.has("nobtn")) return done();

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowane zmiane powód punishmentu ${number}`));
                collector.stop();
            }
        });

        setTimeout(() => {
            collector.stop();
            msg.edit(msg.embeds[0]);
        }, 1000 * 60);

        async function done() {
            if (!flags.has("nobtn")) collector.stop();
            punish.update({
                reason: reason,
            });
            msg.edit(new client.Embed(message).setDescription(`Zmieniono powód punishmentu ${number} na ${reason}`));
        }
    }
};



