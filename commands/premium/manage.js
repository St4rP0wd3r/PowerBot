const BaseCommand = require("../../lib/structures/bot/Command");

module.exports = class Command extends BaseCommand {
    constructor() {
        super({
            name: "manage-premium",
            aliases: ["zarzadzaj-premium", "managep", "managepremium", "mp"],
            description: "Zarzadza premium",
            usage: "<p>premium",
            category: "Premium",
            flags: null,
            permissionLevel: 1,
            premium: true,
        });
    }

    async run(message, { args, flags, prefix, guildConf }) {
        const sender = new client.Sender(message);

        switch (args[0]?.toLowerCase()) {
            case "servers": {
                switch (args[1]) {
                    case "add": {
                        const server = client.guilds.cache.get(args[2]) || client.guilds.cache.find(x => x.name === args[2]);

                        if (!server) return sender.argsError("<p>manage-premium servers add <ID>", prefix, "<ID>");

                        const usrData = await client.database.users.get(message.author.id);

                        if (usrData.premium.servers?.length > 2) return sender.error("Nie możesz dodać wiecej serwerów niż 3");
                        const srvData = await client.database.servers.get(server.id);
                        if (srvData.premium.status) return sender.error("Ten serwer już ma premium");
                        srvData.premium = {
                            status: true,
                            id: message.author.userData.premium?.id,
                        };

                        usrData.premium.servers.push(server.id);
                        srvData.update({
                            premium: srvData.premium,
                        });
                        usrData.update({
                            premium: usrData.premium,
                        });
                        sender.create(`Dodano serwer ${server.name} do premium`);
                        return;
                    }
                    case "remove": {
                        const server = client.guilds.cache.get(args[2]) || client.guilds.cache.find(x => x.name === args[2]) || { id: args[2] };
                        const usrData = await client.database.users.get(message.author.id);

                        if (!server || !usrData.premium.servers.includes(server.id || server)) return sender.argsError("<p>manage-premium servers add <ID>", prefix, "<ID>");

                        const srvData = await client.database.servers.get(server.id);

                        usrData.premium.servers.deleteOne(server.id);
                        srvData.update({
                            premium: {
                                status: false,
                                id: null,
                            },
                        });
                        usrData.update({
                            premium: usrData.premium,
                        });
                        sender.create(`Usunięto serwer ${server.name} do premium`);
                        return;
                    }
                    case "list": {
                        const usrData = await client.database.users.get(message.author.id);
                        const servers = usrData.premium.servers.map(x => {
                            const srv = client.guilds.cache.get(x);
                            if (srv) return `${srv.name} (\`${x}\`)`;
                            else return `${x.id} (\`Server not found\`)`;
                        });
                        sender.create(`Twoje serwery: ${servers.join() || "Brak"}`);
                        return;
                    }

                    default: {
                        const embed = new client.Embed(message)
                            .setDescription("<:icon_settings:705076529561862174> **Konfiguracja serwerów**")
                            .addField("Dodawanie serwera", `\`${prefix}manage-premium servers add <ID>\``)
                            .addField("Usuwanie serwera", `\`${prefix}}manage-premium servers remove <ID>\``)
                            .addField("Lista serwerów", `\`${prefix}}manage-premium servers list\``);
                        return message.reply(embed);
                    }
                }
            }

            default: {
                const embed = new client.Embed(message)
                    .addField("Konfiguracja serwerów", `\`${prefix}manage-premium servers\``);
                return message.reply(embed);
            }

        }
    }
};