const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
/*  Express Config */
app.use("/static", express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "client");
    next();
});
global.dashboard = app;

exports.init = () => {
    require("./authorization");

/* Routes */
const MainRouter = require("./routes/Main");
const DashboardRouter = require("./routes/Dashboard");
const CaptchaRouter = require("./routes/Captcha");
const ApiRouter = require("./routes/Api");
const DashboardApiRouter = require("./routes/DashboardApi");
app.use("/", MainRouter);
app.use("/dashboard/api", DashboardApiRouter);
app.use("/api", ApiRouter);
app.use("/verify", CaptchaRouter);
app.use("/dashboard", DashboardRouter);
app.get("*", (req, res) => {
    res.status(404).render("./errors/404.ejs", {
        pageTitle: "Delover | 404",
        bot: client,
    });
});

app.post("*", (req, res) => {
    res.status(404).render("./errors/404.ejs", {
        pageTitle: "Delover | 404",
        bot: client,
    });
});

app.use((err, req, res, next) => {
    if (err.stack?.toString().includes("Failed to fetch user's guilds")) return res.redirect("/dashboard/api/auth");
    res.status(500).render("./errors/500.ejs", {
        pageTitle: "Delover | 500",
        bot: client,
    });
    console.error(err);

    const embed = new client.Embed()
        .setColor("RED")
        .addField("URL", `\`${req.orginalurl}\``)
        .addField("Error", `\`\`\`js\n${err.stack?.length < 1023 ? err.stack : "\"Too big to display\""}\`\`\``)
        .setAuthor("Dashboard Error", client.user.displayAvatarURL());
    if (req.user) embed.addField("User", req.user.username + " - " + req.user.id);
    if (client.config.settings.node === "production") client.functions.postJsonToApi(client.config.webhooks.errors, { embeds: [embed.toJSON()] });
});
console.log(`Attempt to start dashboard`);

app.listen(client.config.dashboard.port, () => {
    console.log(`Dashboard started`);
})
    .on("error", () => {
        console.warn(`Cannot start dashboard. `);
    });

}