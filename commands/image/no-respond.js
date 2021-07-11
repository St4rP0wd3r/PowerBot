const BaseCommand = require("../../lib/structures/bot/Command");
const Canvas = require("canvas");
const { MessageAttachment } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "brakodpowiedzi",
            aliases: ["noresponding", "nieodpowiada", "brak-odpowiedzi", "no-respond", "norespond"],
            description: "Ktoś nie odpowiada",
            usage: "<p>brakodpowiedzi [użytkownik]",
            category: "Obrazki",
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

        const canvas = Canvas.createCanvas(463, 190);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage("./src/lib/canvas/images/noresponing.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const memberAvatar = await Canvas.loadImage(member.displayAvatarURL({ format: "png" }));
        ctx.drawImage(memberAvatar, 14, 54, 72, 72);
        const att = new MessageAttachment(canvas.toBuffer(), "noresponding.png");
        message.reply(new client.Embed(message).attachFiles(att).setImage("attachment://noresponding.png"));
    }
};