"use strict";
module.exports = dateFormat;

function dateFormat(date, format) {
    // Format: "It's [ddd] today, I'm coding on [MMM DD, YYYY] at [hh:mm:ss]. My Timezone is [ZZ], which is a [zz]."
    // Usage: dateFormat('2020-01-25')
    // Usage: dateFormat(new Date(), <format_pattern>)

    if (!date) date = Date.now();
    if (!format) return date.toString();

    // listing all the possible keys to regexp
    const regExMaps = {
        ddd: new RegExp("sun|mon|tue|wed|thu|fri|sat", "i"),
        MMM: new RegExp("jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec", "i"),
        DD: /\d{2}(?=\s\d{4}\s)/,
        YYYY: /\d{4}(?=\s\d{2}:\d{2}:\d{2})/,
        hh: /\d{2}(?=:\d{2}:\d{2})/,
        mm: /\d{2}(?=:\d{2}\s)/,
        ss: /\d{2}(?=\s[A-Z]{3})/,
        ZZ: /(?<=GMT)[+-]?\d{4}/,
        zz: /(?<=GMT[+-]?\d{4}\s\()[\w\s]+(?=\))/,
    };

    // creating regexp to query the string
    const regExKeys = new RegExp(Object.keys(regExMaps).join("|"), "gi");

    let str = format;
    // extracting the matchable words & looping through
    format.match(regExKeys).forEach((regEx) => {
        if (regExMaps[regEx]) str = str.replace(regEx, new Date(date).toString().match(regExMaps[regEx]));
    });

    return str;
}
