const { MessageEmbed } = require("discord.js-light");

module.exports = class Embed extends MessageEmbed {
    constructor (msg) {
        super();
        if (typeof msg?.author === "object") this.setAuthor(msg.author.tag, msg.author.displayAvatarURL(ImageURLOptions));
        this.setColor(msg?.guild?.settings?.colors?.done || "GREEN");
    };
};