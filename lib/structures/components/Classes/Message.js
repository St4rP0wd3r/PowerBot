const { Structures } = require("discord.js-light");
const ButtonCollector = require("./ButtonCollector");
const APIMessage = require("./APIMessage").APIMessage;
const BaseMessageComponent = require("./interfaces/BaseMessageComponent");
const { MessageEmbed } = require("discord.js-light");

class Message extends Structures.get("Message") {

    _patch(data) {
        super._patch(data);
        this.components = (data.components || []).map(c => BaseMessageComponent.create(c, this.client));
        return this;
    }

    createButtonCollector(filter, options = {}) {
        return new ButtonCollector(this, filter, options);
    }

    awaitButtons(filter, options = {}) {
        return new Promise((resolve, reject) => {
            const collector = this.createButtonCollector(filter, options);
            collector.once("end", (buttons, reason) => {
                if (options.errors && options.errors.includes(reason)) {
                    reject(buttons);
                } else {
                    resolve(buttons);
                }
            });
        });
    }

    async reply(content, options = { mention: false }) {
        if (typeof content === "object" && content !== null && !!(content.embed || content.content)) {
            options = content;
            content = null;
        }
        const mentionRepliedUser = (options ? !!options.mention : false); //typeof ((options || content || {}).allowedMentions || {}).repliedUser === "undefined" ? true : ((options || content).allowedMentions).repliedUser;
        if (content instanceof MessageEmbed) {
            options.embed = content;
            content = null;
        }

        const apiMessage = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this.channel, !content ? "" : content, options).resolveData();
        Object.assign(apiMessage.data, { message_reference: { message_id: this.id, allowed_mentions: { parse: [] } } });
        if (!apiMessage.data.allowed_mentions || Object.keys(apiMessage.data.allowed_mentions).length === 0) apiMessage.data.allowed_mentions = { parse: [] };
        if (typeof apiMessage.data.allowed_mentions.replied_user === "undefined") Object.assign(apiMessage.data.allowed_mentions, { replied_user: mentionRepliedUser });
        const { data, files } = await apiMessage.resolveFiles();
        return this.client.api.channels[this.channel.id].messages
            .post({ data, files })
            .then(d => this.client.actions.MessageCreate.handle(d).message);
    }

    edit(content, options) {
        let newOptions;

        if (content instanceof MessageEmbed) {
            newOptions = {
                disableMentions: "all",
                allowedMentions: { parse: [] },
                embed: content,
            };
            content = null;
        } else newOptions = { disableMentions: "all" };
        if (options?.save_components) newOptions.components = this.components;
        const { data } = content instanceof APIMessage ? content.resolveData() : APIMessage.create(this, !content || content === "[object Object]" ? null : content, newOptions).resolveData();
        return this.client.api.channels[this.channel.id].messages[this.id].patch({ data }).then((d) => {
            const clone = this._clone();
            clone._patch(d);
            return clone;
        });
    }

}

module.exports = Message;