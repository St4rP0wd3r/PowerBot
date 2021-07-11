const BaseCommand = require("../../lib/structures/bot/Command");
const discordbackup = require("../../lib/modules/backups");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");
const ReactionPageMenu = require("../../lib/structures/bot/ReactionPageMenu");
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "backup",
            permissionLevel: 4,
            botPerm: "ADMINISTRATOR",
            description: "Zarządza backupami",
            usage: "<p>backup <akcja (create/info/load/delete)>",
            category: "Administracyjne",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        switch (args[0]) {
            case "create": {
                if (Object.keys(message.author.userData.backups).length > 30) return sender.error("Nie możesz mieć wiecej niż 30 backupow. Usuń jakiś!");
                const guildData = await discordbackup.create(message.guild);
                const { id } = await client.database.backups.create(message.author.id, client.functions.removeUndefineds(guildData));
                message.author.userData.backups[id] = {
                    date: Date.now(),
                    server: { id: message.guild.id, name: message.guild.name },
                };
                message.author.userData.update({ backups: message.author.userData.backups });
                sender.create(`ID backupa: \`${id}\`\n\nBy załadować backupa wpisz \`${prefix}backup load ${id}\``);
                break;
            }

            case "remove": {
                const id = args[1];
                if (!id) return sender.argsError("<p>backup remove <ID>", prefix, "<ID>");
                const backup = await client.database.backups.get(id);
                if (!backup) return sender.argsError("<p>backup remove <ID>", prefix, "<ID>", "Nie znaleziono backupa");

                if (backup.authorid !== message.author.id) return sender.error("Ten backup nie jest twój!");

                backup.remove();
                delete message.author.userData.backups[id];
                message.author.userData.update({ backups: message.author.userData.backups });
                sender.create(`Pomyślnie usunieto backupa o id ${id}`);
                break;
            }

            case "list": {
                const backups = message.author.userData.backups;
                if (!Object.keys(backups).length) return sender.error("Nie posiadasz backupów");
                let formatedBackups = [];
                for (const backup of Object.keys(backups)) {
                    const object = {};
                    Object.assign(object, backups[backup]);
                    object.id = backup;
                    formatedBackups.push(object);
                }
                let pages = [];
                for (const backupChunk of formatedBackups.chunk(5)) {
                    const embed = new client.Embed(message)
                        .setDescription("**<:check_green:814098229712781313> Lista backupów**");
                    for (const backup of backupChunk) embed.addField(`Backup ${backup.id}`, `Serwer: ${backup.server.name} (\`${backup.server.id}\`)\nData wykonania: \`${new Date(backup.date).toLocaleString()}\``);

                    pages.push(embed);
                }
                new ReactionPageMenu({
                    message,
                    channel: message.channel,
                    userID: message.author.id,
                    pages,
                });
                break;
            }

            case "load": {
                const id = args[1];
                if (!id) return sender.argsError("<p>backup load <ID>", prefix, "<ID>");
                const backup = await client.database.backups.get(id);
                if (!backup) return sender.argsError("<p>backup load <ID>", prefix, "<ID>", "Nie znaleziono backupa");

                if (backup.authorid !== message.author.id) return sender.error("Ten backup nie jest twój!");

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

                const embedQuestion = new client.Embed(message)
                    .setDescription("Uwaga, wczytanie backupa usunie wszystko z serwera i wczyta backup!");
                if (flags.has("nobtn")) return done();
                const msg = await message.reply({
                    embed: embedQuestion,
                    components: btnlist,
                });

                const collector = msg.createButtonCollector((btn) => btn.clicker?.user?.id === message.author.id);
                collector.on("collect", btn => {
                    if (btn.id === btnyID.toString()) done();
                    else if (btn.id === btnnID.toString()) {
                        msg.edit(new client.Embed(message).setDescription(`Anulowano wczytywanie backupa`));
                        collector.stop();
                    }
                });

                setTimeout(() => {
                    collector.stop();
                    msg.edit(embedQuestion);
                }, 1000 * 60);

                async function done() {
                    if (!flags.has("nobtn")) collector.stop();
                    const embedDone = new client.Embed(message)
                        .setDescription("Rozpoczęto wczytywanie backupa.\nBackup zostanie wczytany za 2 sekundy");
                    await msg.edit(embedDone);

                    await sleep(2000);

                    await discordbackup.load(backup.data, message.guild);
                }
                break;
            }
            default:
                const embed = new client.Embed(message)
                    .setDescription("<:check_green:814098229712781313> **Backupy**")
                    .addField("Tworzenie", `\`${prefix}backup create\``)
                    .addField("Usuwanie", `\`${prefix}backup remove <ID>\``)
                    .addField("Ładowanie", `\`${prefix}backup load <ID>\``)
                    .addField("Lista", `\`${prefix}backup list\``);
                return message.reply(embed);
        }
    }
}
;
