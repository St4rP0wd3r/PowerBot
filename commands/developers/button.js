const BaseCommand = require("../../lib/structures/bot/Command");
const { MessageComponent, MessageActionRow } = require("../../lib/structures/components");
const { Collection } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "test-button",
            aliases: [],
            category: "",
            description: "",
            usage: "<p>",
            flags: null,
            disabled: false,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const btn1 = new MessageComponent()
            .setStyle(5)
            .setURL("https://client.xyz")
            .setLabel("Strona bota")
            .setEmoji("814098229712781313");
        const btn2ID = Math.random(1, 9999999);
        const btn2 = new MessageComponent()
            .setLabel("siema")
            .setID(btn2ID)
            .setStyle(1);
        const btn3 = new MessageComponent()
            .setStyle(5)
            .setURL("https://canary.discord.com/channels/703156079890268180/846798233569067018/846803962333102140")
            .setLabel("wiadomosc")
            .setEmoji("814098229712781313");
        const embed = new client.Embed(message)
            .setDescription("siemanko kochanie ez");
        const mainBtn = new MessageActionRow()
            .addComponents([btn1, btn2, btn3]);
        const msg = await message.reply("", {
            embed,
            components: [mainBtn],
        });
        const collector = msg.createButtonCollector(() => true);
        collector.on("collect", btn => {
        });

        collector.on("end", () => console.log("ernd"));
    }
};