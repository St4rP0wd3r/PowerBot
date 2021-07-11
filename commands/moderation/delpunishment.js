const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "delpunishment",
            aliases: ["delpunish", "delcase"],
            permissionLevel: 4,
            description: "Usuwa punishment",
            usage: "<p>delpunishment <ID>",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const number = args[0];

        if (!number || !parseInt(number)) return sender.argsError(this.help.usage, prefix, "<ID>");

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
            embed: new client.Embed(message).setDescription(`Czy napewno chcesz usunąć punishment o id ${number}?`),
            components: btnlist,
        });

        const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
        collector.on("collect", btn => {


            if (btn.id === btnyID.toString()) done();
            else if (btn.id === btnnID.toString()) {
                msg.edit(new client.Embed(message).setDescription(`Anulowano usunięcie punishmentu o id ${number}`));
                collector.stop();
            }
        });

        setTimeout(() => {
            collector.stop();
            msg.edit(msg.embeds[0]);
        }, 1000 * 60);

        const done = () => {
            collector.stop();
            punish.remove();
            msg.edit(new client.Embed(message).setDescription(`Usunięto punishment o id ${number}`));
        };
    }
};

