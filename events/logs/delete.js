const BaseEvent = require("../../lib/structures/bot/Event");
const fs = require("fs");
const { MessageAttachment } = require("discord.js-light");
const moment = require("moment");
moment.locale("PL");

class Event extends BaseEvent {
    constructor() {
        super({
            name: "messageDelete",
            discord: "messageDelete",
        });
    }

    async run(message) {
        if (message?.partial) await message.fetch().catch(() => null);
        if (!message.guild || !message.author || message.author.bot) return;
        const guildConf = await client.database.servers.get(message.guild.id);

        if (!guildConf.logs?.channel || !guildConf.logs.status) return;
        if (message.partial) await message.fetch();
        const out = client.channels.cache.get(guildConf.logs.channel);
        let msgContent = message.content || "Wiadomość zawiera embed";
        let files = [];
        if (msgContent.length > 1047) {
            const path = `./cache/${Math.randomInt(1, 999999)}_logs_delete_${message.guild.id}.txt`;

            await fs.writeFileSync(path, msgContent);

            msgContent = "Wiadomość znajduje sie w pliku";

            files.push(new MessageAttachment(path, "logs.txt"));
            setTimeout(() => fs.unlinkSync(path), 1000);
        }

        const embed = new client.Embed()
            .setColor(guildConf?.colors?.done)
            .setTitle("<:icon_msg_rm:724362248989966346> Usunięcie wiadomości")
            .addField("Autor:", `${message.author.username} (\`${message.author.id}\`)`)
            .addField("Kanał:", `${message.channel}`)
            .setThumbnail(message.author.displayAvatarURL(ImageURLOptions))
            .addField("Data wysłania wiadomości", `\`${moment(message.createdAt).format("LLLL")}\` (\`${moment(message.createdAt).fromNow()}\`)`)
            .addField("Treść wiadomości", msgContent)
            .addField("Pliki:", message.attachments.map(x => x.proxyURL).join("\n") || "Brak")

            .addField("ID:", `[${message.id}](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`);

        if (out) out.send("", { embed: embed, files: files });
    }
}

module.exports = Event;
