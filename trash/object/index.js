module.exports.toObject = (data, key, val) => {
    if (!Array.isArray(data)) throw new Error("INVALID_DATA");
    if (!key || typeof key !== "string") throw new Error("INVALID_KEY");

    const newObj = {};
    if (data.length > 0) {
        for (const item of data) {
            newObj[item[key] + ""] = !!val ? item[val] : item;
        }
    }
    return newObj;
};

module.exports.removeFalsy = (obj) => {
    const newObj = {};
    for (const prop of Object.keys(obj)) {
        if (obj[prop]) {
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
};
