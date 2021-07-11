const util = require("util");
const r = require("rethinkdb");
module.exports = function (connect) {
    const Store = (connect.session) ? connect.session.Store : connect.Store;

    function RethinkStore(options) {
        this.options = options || {};

        this.options.table = this.options.table || "Session";
        this.options.browserSessionsMaxAge = this.options.browserSessionsMaxAge || 86400000;

        Store.call(this, this.options);
    }

    util.inherits(RethinkStore, Store);

    RethinkStore.prototype.get = function (sid, fn) {
        return r.table(this.options.table)
            .get(sid)
            .run(client.database.conn)
            .then((data) => {
                return data ? data.session : null;
            }).asCallback(fn);
    };

    RethinkStore.prototype.set = function (sid, sess, fn) {
        const sessionToStore = {
            id: sid,
            expires: new Date(Date.now() + (sess.cookie.originalMaxAge || this.options.browserSessionsMaxAge)),
            session: sess,
        };
        return r.table(this.options.table)
            .insert(sessionToStore, {
                conflict: "replace",
            })
            .run(client.database.conn)
            .then((data) => {
                return data;
            })
            .asCallback(fn);
    };

    RethinkStore.prototype.destroy = function (sid, fn) {
        return r.table(this.options.table)
            .get(sid)
            .delete()
            .run(client.database.conn)
            .tap((data) => {
                return data;
            })
            .asCallback(fn);
    };

    RethinkStore.prototype.clear = function (fn) {
        return r.table(this.options.table)
            .delete()
            .run(client.database.conn)
            .asCallback(fn);
    };

    RethinkStore.prototype.length = function (fn) {
        return r.table(this.options.table)
            .count()
            .run(client.database.conn)
            .asCallback(fn);
    };

    return RethinkStore;
};