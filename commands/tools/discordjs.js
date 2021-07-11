const BaseCommand = require("../../lib/structures/bot/Command");

const fetch = require("node-fetch");
const { MessageEmbed } = require("discord.js-light");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "discordjs",
            aliases: ["djs"],
            description: "Wysuzkuje daną klase/property w djs docs",
            usage: "<p>discordjs <fraza>",
            category: "Narzędzia",
        });
    }

    async run(message, { args, prefix }) {
        const sender = new client.Sender(message);
        const search = args.join(" ").replaceAll("#", ".");
        if (!search) return sender.argsError(this.help.usage, prefix, "<fraza>");
        const version = args[1] || "stable";

        const body = await fetch(`https://djsdocs.sorta.moe/v1/main/${version}/embed?q=${search}`)
            .then(res => res.json());

        if (!body || body.status === 404) return sender.argsError(this.help.usage, prefix, "<fraza>", "Podaj fraze która istnieje w Discord.JS.");
        const embed = new MessageEmbed(body)
            .setAuthor(message.author.tag, message.author.displayAvatarURL(ImageURLOptions))
            .setColor(message?.guild?.settings?.colors?.done || "GREEN");
        message.reply(embed);
    }
};

