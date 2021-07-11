module.exports = async (req, res, next) => {
    if (req.isAuthenticated()) {
        const usrData = await client.database.users.get(req.user.id);
        if (usrData.gban?.status) return res.render("gban.ejs", {
            userData: usrData,
            moment: require("moment"),
            pageTitle: "Delover | Gban",
        });
        return next();
    }
    req.session.backURL = req.originalUrl;
    res.redirect("/dashboard/api/auth");
};