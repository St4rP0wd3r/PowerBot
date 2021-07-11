module.exports = async (req, res, next) => {
    const guild = client.guilds.cache.get(req.params.ID);
    if (!guild) return res.redirect("/dashboard");

    const member = await guild.members.fetch(req.user.id);
    if (!member) return res.redirect("/dashboard");

    if (!member.permissions.has("ADMINISTRATOR") && !client.config.perms.developer.includes(member.id)) return res.redirect("/dashboard");
    req.member = member;
    req.guild = guild;
    next();
};