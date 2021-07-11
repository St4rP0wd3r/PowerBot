module.exports = class Command {
    constructor({
                    name = null,
                    disabled = false,
                    aliases = [],
                    permissionLevel = 1,
                    description = "Nie podano",
                    usage = "Nie podano",
                    flags = "Brak",
                    category = "Brak",
                    botPerms = ["SEND_MESSAGES", "VIEW_CHANNEL"],
                    args = [],
                    cooldown = 2,
                }) {
        this.conf = {
            name,
            aliases,
            disabled,
            permissionLevel,
            botPerms,
            args,
            cooldown,
        };
        this.help = {
            description,
            usage,
            flags,
            category,
        };
    }

    async reload() {
        const filename = this.conf.fileName;
        delete require.cache[require.resolve(`../../../commands/${filename}`)];
        const file = require(`../../../commands/${filename}`);
        const newCommand = new file();
        newCommand.conf.fileName = filename;
        client.commands.set(newCommand.conf.name, newCommand);
        return true;
    }

    async unload() {
        return client.commands.delete(this.conf.name);
    }
};