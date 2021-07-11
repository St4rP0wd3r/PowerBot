const BaseCommand = require("../../lib/structures/bot/Command");
const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "win-tapeta",
            aliases: ["wintapeta"],
            description: "Avatar na tapecie windowsa",
            usage: "<p>wintapeta [użytkownik]",
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

        const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: "png" }));
        ctx.drawImage(avatar, 0, 0, 1920, 1080);
        const background = await Canvas.loadImage("./src/lib/canvas/images/wintapeta.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const att = new MessageAttachment(canvas.toBuffer(), "tapeta.png");
        message.reply(new client.Embed(message).attachFiles(att).setImage("attachment://tapeta.png"));
    }
};