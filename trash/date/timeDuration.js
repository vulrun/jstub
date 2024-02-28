"use strict";
module.exports = timeDuration;

function timeDuration(val, { as, tiny = false }) {
    val = typeof val === "number" && isFinite(val) ? Math.abs(val) : Date.now() - parseInt(val);

    if (!val) throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));

    const tinyUnit = { Y: "yr", M: "month", W: "wk", D: "day", h: "hr", m: "min", s: "sec" };
    const longUnit = { Y: "year", M: "month", W: "week", D: "day", h: "hour", m: "minute", s: "second" };

    const _s = 1000;
    const _m = _s * 60;
    const _h = _m * 60;
    const _d = _h * 24;
    const period = {
        Y: _d * 365.25,
        M: _d * 30,
        W: _d * 7,
        D: _d,
        h: _h,
        m: _m,
        s: _s,
    };

    let num, unit;
    if (as) {
        unit = as;
        num = Math.floor(val / period[unit]);
    } else {
        for (unit in period) {
            const unitInMs = period[unit];
            if (val < unitInMs) continue;

            num = Math.floor(val / unitInMs);
            break;
        }
    }

    this.format = function (str) {
        return String(str || "%d%s")
            .replace(/%d/g, num)
            .replace(/%s/g, unit)
            .replace(/%S/g, (!!tiny ? tinyUnit[unit] : longUnit[unit]) + (num > 1 ? "s" : ""));
    };

    return this;
}
