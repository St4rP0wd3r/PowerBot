class Sender {
    constructor(message) {
        this.message = message;
        this.colors = message.guild?.settings?.colors || { done: "GREEN", error: "RED" };
    }

    async create(text = "", footer = "", color = this?.colors?.done) {
        const embed = new client.Embed(this.message)
            //.setTitle(title)
            .setDescription("<:check_green:814098229712781313> " + text)
            .setFooter(footer)
            .setColor(color)
            .setAuthor(this.message.author.tag, this.message.author.displayAvatarURL(ImageURLOptions));
        return await this.message.reply(embed);
    }

    async error(text = "", footer = "", color = this?.colors?.error) {
        const embed = new client.Embed(this.message)
            //.setTitle(title)
            .setDescription("<:check_red:814098202063405056> " + text)
            .setFooter(footer)
            .setColor(color)
            .setAuthor(this.message.author.tag, this.message.author.displayAvatarURL(ImageURLOptions));
        return await this.message.reply(embed);
    }

    async argsError(usage, prefix, arg, optionalMessage = "") {
        return await this.error(`Nieprawidłowy argument \`${arg}\`. ${optionalMessage}\n\nPoprawne użycie: \n\`${usage.replace(/<p>/g, prefix)}\``);
    }

}

module.exports = Sender;