const BaseCommand = require("../../lib/structures/bot/Command");
const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "paint",
            aliases: [],
            description: "Avatar użytkownika w paincie",
            usage: "<p>paint [użytkownik]",
            category: "Obrazki",
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const member = await client.functions.getUser(message, args[0]) || message.author;

        const canvas = Canvas.createCanvas(1920, 1080);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage("./src/lib/canvas/images/paint.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 5, 176, 850, 770);
        const att = new MessageAttachment(canvas.toBuffer(), "noresponding.png");
        message.reply(new client.Embed(message).attachFiles(att).setImage("attachment://noresponding.png"));
    }
};