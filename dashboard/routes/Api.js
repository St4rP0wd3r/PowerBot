const Router = require("express").Router();
const checkToken = require("../middlewares/api/checkToken");
const { inspect } = require("util");


Router.post("/settings/update", checkToken, async (req, res) => {
        const guildID = req.body.guildID;
        const settings = req.body.settings;

        if (!guildID || typeof settings !== "object") return res.status(400).json({
            message: "Bad request",
            code: 400,
        });

        const guildConf = await client.database.servers.get(guildID);

        await guildConf.update(settings)
            .then(() => {
                res.status(200).json({
                    message: "Updated.",
                    status: 200,
                });
            })
            .catch(() => {
                res.status(500).json({
                    message: "Cannot update.",
                    status: 500,
                });
            });
        const embed = new client.Embed()
            .setColor("GREEN")
            .addField("Client", req.token.name)
            .addField("Server ID", guildID)
            .addField("Updated values", `\`\`\`js\n${inspect(settings, { depth: 0 })?.length < 500 ? inspect(settings, { depth: 0 }) : "\"Too big to display\""}\`\`\``)
            .setAuthor("API Server settings update", client.user.displayAvatarURL())
            .toJSON();
        if (client.config.settings.node === "production") client.functions.postJsonToApi(client.config.webhooks.api, { embeds: [embed] });
    },
);

Router.post("/settings/get", checkToken, async (req, res) => {
    const guildID = req.body.guildID;

    if (!guildID) return res.status(400).json({
        message: "Bad request",
        code: 400,
    });

    const guildConf = await client.database.servers.get(guildID);
    res.status(200).json({
        message: "Updated",
        settings: await guildConf.toJSON(),
        status: 200,
    });

    const embed = new client.Embed()
        .setColor("GREEN")
        .addField("Client", `${req.token.name}`)
        .addField("Server ID", `${guildID}`)
        .setAuthor("API Server settings get", client.user.displayAvatarURL())
        .toJSON();
    client.functions.postJsonToApi(client.config.webhooks.api, { embeds: [embed] });
});

Router.get("*", (req, res) => {
    res.status(404).json({
        message: "Not found",
        code: 404,
    });
});

Router.post("*", (req, res) => {
    res.status(404).json({
        message: "Not found",
        code: 404,
    });
});

Router.post("/webhook", (req, res) => {
    console.test(req.headers);
    console.test(req.body);
    res.status(200).json({
        success: true,
    });
});

Router.use((err, req, res, _next) => {
    res.status(500).json({
        message: "Unkown error",
        code: 500,
    });
    console.error(err.stack);
});

module.exports = Router;