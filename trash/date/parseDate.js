module.exports = parseDate;

function parseDate(inp) {
    let matched;
    const time24RegEx = /^\s*(?:0?\d|1\d|2[0123])(?:\:[012345]\d)(?:\:[012345]\d)?(?!\:)\s*$/gm;
    const time12RegEx = /^\s*((?:0?\d|1[012])(?:\:[012345]\d)(?:\:[012345]\d)?)(?!\:)\s?([aApP][mM])\s*$/gm;

    if ((matched = time24RegEx.exec(inp))) {
        inp = `1970-01-01 ${inp} +0:00`;
        return Date.parse(inp);
    }

    if ((matched = time12RegEx.exec(inp))) {
        inp = `1970-01-01 ${matched[1]} +0:00`;
        return Date.parse(inp) + (matched[2].toLowerCase() == "pm" ? 12 * 60 * 60 * 1e3 : 0);
    }

    return Date.parse(inp);
}
