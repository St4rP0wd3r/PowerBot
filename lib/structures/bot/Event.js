module.exports = class Event {
    constructor ({
                     name = null,
                     discord = null,
                     fileName = null,
                     once = false,
                 }) {
        this.conf = { name, discord, fileName, once };
    }

    async reload () {
        const filename = this.conf.fileName;
        delete require.cache[require.resolve(`../../../events/${filename}`)];
        const file = require(`../../../events/${this.conf.fileName}`);
        const newCommand = new file();
        newCommand.conf.fileName = filename;
        client.events.set(newCommand.conf.name, newCommand);
        return true;
    };

    async unload () {
        return client.events.delete(this.conf.name);
    };
};