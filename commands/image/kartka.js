const BaseCommand = require("../../lib/structures/bot/Command");
const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js-light");

const format = (ctx, text, maxWidth) => {
    let lines = [];
    let currentLine = text.split(" ")[0];
    for (let i = 1; i < text.split(" ").length; i++) {
        let word = text.split(" ")[i];
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kartka",
            aliases: [],
            description: "Avatar użytkownika na karcie",
            usage: "<p>kartka <tekst>",
            category: "Obrazki",
            flags: null,
            disabled: false,
            permissionLevel: 1,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);
        const text = args.join(" ");

        if (!text) return sender.argsError(this.help.usage, prefix, "<tekst>");
        const canvas = Canvas.createCanvas(4128, 1956);
        const ctx = canvas.getContext("2d");
        const background = await Canvas.loadImage("./src/lib/canvas/images/kartka.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.font = "75px Sans";
        ctx.fillText(format(ctx, args.join(" "), 1600).join("\n"), 1220, 530);

        const att = new MessageAttachment(canvas.toBuffer(), "kartka.png");
        message.reply(new client.Embed(message).attachFiles(att).setImage("attachment://kartka.png"));
    }
};