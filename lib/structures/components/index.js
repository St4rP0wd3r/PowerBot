const { Structures } = require("discord.js-light");
exports.init = () => {
    const TextChannel = require("./Classes/TextChannel");
    const DMChannel = require("./Classes/DMChannel");
    const NewsChannel = require("./Classes/NewsChannel");
    Structures.extend("TextChannel", () => TextChannel);
    Structures.extend("DMChannel", () => DMChannel);
    Structures.extend("NewsChannel", () => NewsChannel);
    const Message = require("./Classes/Message");
    Structures.extend("Message", () => Message);

    client.ws.on("INTERACTION_CREATE", (data) => {
        if (!data.message) return;

        if (data.data.component_type) {
            const INTERACTION_CREATE = require("./Classes/Interaction");
            const button = new INTERACTION_CREATE(client, data);

            client.emit("clickButton", button);
        }
    });

};

exports.MessageComponent = require(`./Classes/MessageComponent`);
exports.MessageActionRow = require("./Classes/MessageActionRow");
exports.ComponentInteraction = require("./Classes/Interaction");