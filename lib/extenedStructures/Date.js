const moment = require("moment");
moment.locale("PL");

Date.prototype.toLocaleString = function () {
    return moment(this).format("LLLL");
};