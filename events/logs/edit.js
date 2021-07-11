const BaseEvent = require("../../lib/structures/bot/Event");
const fs = require("fs");
const { MessageAttachment } = require("discord.js-light");
const moment = require("moment");
moment.locale("PL");

class Event extends BaseEvent {
    constructor() {
        super({
            conf: {
                name: "messageUpdate",
                discord: "messageUpdate",
            },
        });
    }

    async run(oldMessage, newMessage) {
        if (newMessage?.partial) await newMessage.fetch().catch(() => null);
        const message = newMessage;
        if (!message.guild || !message.author || message.author.bot) return;

        if (oldMessage?.partial) await oldMessage.fetch().catch(() => null);


        const guildConf = await client.database.servers.get(message.guild.id);
        if (!guildConf.logs?.channel || !guildConf.logs?.status) return;
        if (oldMessage.content === newMessage.content) return;
        const out = client.channels.cache.get(guildConf.logs?.channel);
        if (!out) return;
        let msgContent1 = oldMessage.content || "Wiadomość zawiera embed";
        let msgContent2 = newMessage.content || "Wiadomość zawiera embed";
        let files = [];
        if (msgContent1.length >= 1047 || msgContent2.length > 1047) {

            const path = `./cache/${Math.randomInt(1, 999999)}_logs_edit_${message.guild.id}.txt`;
            const content = `Wcześniejsza wiadomość: ${msgContent1}\nEdytowana wiadomość: ${msgContent2}`;
            await fs.writeFileSync(path, content);

            msgContent1 = "Wiadomość znajduje sie w pliku";
            msgContent2 = "Wiadomość znajduje sie w pliku";

            files.push(new MessageAttachment(path, "logs.txt"));
            setTimeout(() => fs.unlinkSync(path), 1000);
        }
        const embed = new client.Embed(oldMessage)
            .setColor(guildConf?.colors?.done)
            .setTitle("<:icon_msg_update:724362337716535416> Wiadomość edytowana!")
            .addField("Autor:", `${message.author.username} (\`${message.author.id}\`)`)
            .addField("Kanał:", message.channel)
            .setThumbnail(message.author.displayAvatarURL(ImageURLOptions))
            .addField("Data wysłania wiadomości", `\`${moment(message.createdAt).format("LLLL")}\` (\`${moment(message.createdAt).fromNow()}\`)`)
            .addField("Stara wiadomość", msgContent1)
            .addField("Nowa wiadomość", msgContent2)
            .addField("Pliki:", message.attachments.map(x => x.proxyURL).join("\n") || "Brak")
            .addField("ID:", `[${oldMessage.id}](https://discordapp.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})`);
        if (out) out.send("", { embed: embed, files: files });
    }
}

module.exports = Event;