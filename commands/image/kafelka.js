const BaseCommand = require("../../lib/structures/bot/Command");
const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "kafelka",
            aliases: ["windows-kafelka"],
            description: "Ktoś na kafelce windowsa",
            usage: "<p>kafelka [użytkownik]",
            category: "Obrazki",
            flags: null,
            disabled: false,
            permissionLevel: 1,
            args: [{
                name: "użytkownik",
                ifFail: "Musisz podać poprawnego użytkownika",
                description: "Użytkownik",
                required: false,
                check: async (args, { message }) => {
                    if (!args[0]) return true;
                    return await client.functions.getUser(message, args[0]);
                },
            }],
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const member = await client.functions.getUser(message, args[0]) || message.author;

        const canvas = Canvas.createCanvas(1920, 1080);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage("./src/lib/canvas/images/kafelka.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 405, 291, 125, 125);

        const att = new MessageAttachment(canvas.toBuffer(), "kafelka.png");
        message.reply(new client.Embed(message).attachFiles(att).setImage("attachment://kafelka.png"));
    }
};