const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "setlevel",
            aliases: ["st", "ustawpoziom"],
            permissionLevel: 4,
            description: "Ustawia użytkownikowi poziom",
            usage: "<p>setlevel <użytkownik> <poziom>",
            category: "Poziomy",
        });
    }

    async run(message, { args, guildConf, prefix }) {
        const sender = new client.Sender(message);
        if (!guildConf.leveling?.status) return sender.error("System poziomów jest wyłączony!");
        const member = await client.functions.getUser(message, args[0]);
        if (!member) return sender.argsError(this.help.usage, prefix, "<użytkownik>");
        const level = args[1];
        const userData = await client.database.leveling.get(message.guild.id, member.id);

        if (!level || typeof parseInt(level) !== "number" || parseInt(level) < 0) return sender.argsError(this.help.usage, prefix, "<poziom>");

        userData.update({
            level: parseInt(level),
        });

        await message.reply(new client.Embed(message)
            .setDescription(`<:check_green:814098229712781313>** ** Użytkownik **<@${member.id}>** (\`${member.tag}\`) posiada teraz poziom ${level}.`),
        );
    }
};

