const { readdirSync, writeFileSync, unlinkSync } = require("fs");
const { inspect } = require("util");
const { MessageAttachment } = require("discord.js-light");
exports.init = () => {
    for (const dir of readdirSync("./src/events/")) {
        const commands = readdirSync(`./src/events/${dir}/`).filter(file => file.endsWith(".js"));

        for (const file of commands) {
            const pull = require(`../../events/${dir}/${file}`);
            try {
                const ev = new pull();
                ev.conf.fileName = `${dir}/${file}`;

                client.events.set(ev.conf.name, ev);
                if (ev.conf.discord) {
                    if (ev.conf.once) client.once(ev.conf.discord, (...args) => client.events.get(ev.conf.name).run(...args).catch(async error => {
                        const embed = new client.Embed()
                            .setColor("RED")
                            .addField("Event Error", ev.conf.name)
                            .setDescription(`\`\`\`js\n${error.stack?.length < 2047 ? error.stack : "\"W pliku\""}\`\`\``)
                            .setAuthor("Event Error", client.user.displayAvatarURL())
                            .toJSON();
                        console.error(error.stack);
                        if (client.config.settings.node === "production") {
                            if (error.stack?.length > 2047) {
                                const path = `./cache/${Math.randomInt(1, 999999)}_error_stack_${ev.conf.name}.txt`;
                                await writeFileSync(path, error.stack);
                                const file = new MessageAttachment(path, "error.txt");
                                client.functions.postWebhook(client.config.webhooks.errors, {
                                    embeds: [embed],
                                    files: [file],
                                });
                                setTimeout(() => unlinkSync(path), 500);
                            } else {
                                client.functions.postWebhook(client.config.webhooks.errors, {
                                    embeds: [embed],
                                });
                            }
                        }
                    }));
                    else client.on(ev.conf.discord, (...args) => client.events.get(ev.conf.name).run(...args).catch(async error => {
                        const embed = new client.Embed()
                            .setColor("RED")
                            .addField("Event", ev.conf.name)
                            .setDescription(`\`\`\`js\n${error.stack?.length < 2047 ? error.stack : "\"W pliku\""}\`\`\``)
                            .setAuthor("Event Error", client.user.displayAvatarURL())
                            .toJSON();
                        console.error(error.stack);
                        if (client.config.settings.node === "production") {
                            if (error.stack?.length > 2047) {
                                const path = `./cache/${Math.randomInt(1, 999999)}_error_stack_${ev.conf.name}.txt`;
                                await writeFileSync(path, error.stack);
                                const file = new MessageAttachment(path, "error.txt");
                                client.functions.postWebhook(client.config.webhooks.errors, {
                                    embeds: [embed],
                                    files: [file],
                                });
                                setTimeout(() => unlinkSync(path), 500);
                            } else {
                                client.functions.postWebhook(client.config.webhooks.errors, {
                                    embeds: [embed],
                                });
                            }
                        }
                    }));
                }
            } catch (err) {
                console.warn(`Cannot load event ${dir}/${file}`);
                console.error(err);
            }
        }
    }
    if (client.config.settings.node === "production") process.on("unhandledRejection", (reason, promise) => {
        const embed = new client.Embed()
            .setColor("RED")
            .setAuthor("Unhandled Rejection", client.user?.displayAvatarURL())
            .addField("Promise", `\`\`\`${inspect(promise, { depth: 0 })}\`\`\``)
            .addField("Reason", `\`\`\`${inspect(reason, { depth: 0 })}\`\`\``)
            .toJSON();
        client.functions.postJsonToApi(client.config.webhooks.rejection, { embeds: [embed] });
    });

};