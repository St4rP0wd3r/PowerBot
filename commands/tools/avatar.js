const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "avatar",
            aliases: ["awatar", "profilowe", "zdjecie"],
            description: "Pokazuje avatar uzytkownika",
            usage: "<p>avatar <Użytkownik>",
            category: "Narzędzia",
        });
    }

    async run(message, { args }) {
        const target = await client.functions.getUser(message, args[0]) || message.author;

        let desc = `[png](${target.displayAvatarURL({
            size: 1024,
            format: "png",
        })}) | [jpg](${target.displayAvatarURL({
            size: 1024,
            format: "jpg",
        })}) | [webp](${target.displayAvatarURL({ size: 1024, format: "webp" })})`;
        if (target.displayAvatarURL({ dynamic: true }).endsWith(".gif")) desc += ` | [gif](${target.displayAvatarURL({
            size: 1024,
            format: "gif",
        })})`;

        message.reply(new client.Embed(message)
            .setTitle(target.tag)
            .setDescription(`» ${desc} «`)
            .setImage(target.displayAvatarURL(ImageURLOptions)),
        );
    }

};

