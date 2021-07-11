const now = new Date();
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const days_in_month = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const weeks_in_month = days_in_month / 7;
const mth = w * weeks_in_month;
const y = mth * 12;

module.exports = (val) => {
    const type = typeof val;
    if (type === "string" && val.length > 0) {
        const str = val;
        if (str.length > 100) return null;

        const regex = /(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|mths?|years?|yrs?|[smhdwy])?/gi;
        const match = str.match(regex);
        if (!match) return null;

        const parse_arrays = match.map((q, n, p) => regex.exec(p)).map((array) => array.splice(1));
        let n = 0;
        parse_arrays.forEach((value) => {
            const type = (value[1] || "").toLowerCase();
            if (["years", "year", "yrs", "yr", "y"].includes(type)) n += value[0] * y;
            if (["months", "month", "mths", "mth"].includes(type)) n += value[0] * mth;
            if (["weeks", "week", "w"].includes(type)) n += value[0] * w;
            if (["days", "day", "d"].includes(type)) n += value[0] * d;
            if (["hours", "hour", "hrs", "hr", "h"].includes(type)) n += value[0] * h;
            if (["minutes", "minute", "mins", "min", "m"].includes(type)) n += value[0] * m;
            if (["seconds", "second", "secs", "sec", "s"].includes(type)) n += value[0] * s;
            if (["milliseconds", "millisecond", "msecs", "msec", "ms"].includes(type)) n += value[0];
        });
        if (typeof n !== "number" || n.toString().startsWith("-")) return null;
        return n || null;
    }

    return null;
};

module.exports.parse = milliseconds => {
    if (typeof milliseconds !== "number") {
        throw new TypeError("Expected a number");
    }

    const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

    return {
        days: roundTowardsZero(milliseconds / 86400000),
        hours: roundTowardsZero(milliseconds / 3600000) % 24,
        minutes: roundTowardsZero(milliseconds / 60000) % 60,
        seconds: roundTowardsZero(milliseconds / 1000) % 60,
        milliseconds: roundTowardsZero(milliseconds) % 1000,
        microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
        nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000,
    };
};