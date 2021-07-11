const { Structures } = require("discord.js-light");
const { APIMessage } = require("./APIMessage");
const { MessageEmbed } = require("discord.js-light");

class TextChannel extends Structures.get("TextChannel") {
    async send(content, options = {}) {
        if (typeof content === "object" && content !== null) {
            options = content;
            content = null;
        }
        const User = Structures.get("User");
        const GuildMember = Structures.get("GuildMember");

        if (this instanceof User || this instanceof GuildMember) {
            return this.createDM().then(dm => dm.send(content, options));
        }

        if (content instanceof MessageEmbed) {
            options.embed = content;
            content = null;
        }
        let apiMessage;

        if (content instanceof APIMessage) {
            apiMessage = content.resolveData();
        } else {
            apiMessage = APIMessage.create(this, !content ? "" : content, options).resolveData();
        }

        if (Array.isArray(apiMessage.data.content)) {
            return Promise.all(apiMessage.data.content.map(this.send.bind(this)));
        }

        const { data, files } = await apiMessage.resolveFiles();
        return this.client.api.channels[this.id].messages
            .post({ data, files })
            .then(d => this.client.actions.MessageCreate.handle(d).message);
    }
}

module.exports = TextChannel;