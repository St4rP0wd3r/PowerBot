const { readdirSync } = require("fs");

exports.init = () => {
    const commands = readdirSync(`./src/slash-commands/`).filter(file => file.endsWith(".js"));

    for (const file of commands) {
        const pull = require(`../../slash-commands/${file}`);
        try {
            const cmd = new pull();
            client.api.applications(client.config.dashboard.clientID).commands.post(cmd.options);
            client.slashCommands.set(cmd.options.data.name, cmd);
        } catch (err) {
            console.warn(`Cannot load slash command ${file}`);
            console.error(err);
        }
    }
    client.ws.on("INTERACTION_CREATE", async interaction => {
        const command = client.slashCommands.get(interaction.data.name);
        if (command) command.run(interaction);
    });
};
