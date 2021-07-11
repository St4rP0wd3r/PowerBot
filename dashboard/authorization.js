const scopes = ["identify", "guilds"];
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const session = require("express-session");
const DashboardStore = require("../lib/modules/DashboardSession")(session);
dashboard.use(session({
    secret: "3927243c936f3f22f0f1d557e875fd3cf5067704c91b1371cd56bea030e9149c61fed585",
    resave: true,
    saveUninitialized: true,
    store: new DashboardStore(),
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new Strategy({
    clientID: client.config.dashboard.clientID,
    clientSecret: client.config.dashboard.secret,
    callbackURL: client.config.dashboard.redirects.main,
    prompt: "consent",
    scope: scopes,
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    });
}));

dashboard.use(passport.initialize());
dashboard.use(passport.session());
dashboard.passport = passport;

