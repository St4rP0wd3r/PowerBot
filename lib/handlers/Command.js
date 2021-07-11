const { readdirSync } = require("fs");

exports.init = () => {
    for (const dir of readdirSync("./src/commands/")) {
        const commands = readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith(".js"));

        for (const file of commands) {
            const pull = require(`../../commands/${dir}/${file}`);
            try {
                const cmd = new pull();
                cmd.conf.fileName = `${dir}/${file}`;
                client.commands.set(cmd.conf.name, cmd);
            } catch (err) {
                console.warn(`Cannot load command ${dir}/${file}`);
                console.error(err);
            }
        }
    }
};