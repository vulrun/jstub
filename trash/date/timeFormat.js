"use strict";
module.exports = timeFormat;

function timeFormat(secs, format) {
    if (secs < 5) return "";
    secs = Math.floor(secs / 1000);

    let out = [];

    const hh = Math.floor(secs / 3600);
    const mm = Math.floor((secs / 60) % 60);
    const ss = Math.floor(secs % 60);

    // push to array
    hh > 0 && out.push(hh);
    out.push(mm, ss);

    out = out.map((i) => String(i).padStart(2, "0")).join(":");
    return out;
}
