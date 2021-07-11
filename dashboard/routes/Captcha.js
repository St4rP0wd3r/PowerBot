const Router = require("express").Router();

Router.get("/", (req, res) => {
    res.redirect("/");
});

Router.get("/:ID", async (req, res) => {
    res.render("verify/main.ejs", {
        siteKey: client.config.captcha.sitekey,
        pageTitle: "Delover | Weryfikacja",
    });
});

Router.post("/:ID", async (req, res) => {
    const resposn = await client.functions.getJsonFromApi(`https://www.google.com/recaptcha/api/siteverify?secret=${client.config.captcha.secret}&response=${req.body["g-recaptcha-response"]}`);
    if (!resposn.success) return res.render("verify/fail", {
        pageTitle: "Delover | Weryfikacja",
        captchaurl: `/verify/${req.params.ID}`,
    });
    res.render("verify/done", {
        pageTitle: "Delover | Weryfikacja",
        captchaurl: `/verify/${req.params.ID}`,
    });
});

module.exports = Router;