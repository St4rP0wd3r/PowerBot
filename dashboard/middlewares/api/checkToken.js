module.exports = async (req, res, next) => {
    const auth = req.headers["authorization"];
    const url = req.url;
    if (!client.config.api.tokens.find(x => x.token === auth)) return res.status(401).json({
        message: "Unathorized",
        code: 401,
        powered_by: "delover.pro",
    });

    if (!client.config.api.tokens.find(x => x.token === auth).access.includes("all") && !client.config.api.tokens.find(x => x.token === auth).access.includes(url)) return res.status(401).json({
        message: "Unathorized",
        code: 401,
        powered_by: "delover.pro",
    });

    req.token = client.config.api.tokens.find(x => x.token === auth);
    next();
};

