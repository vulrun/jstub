const { isUndefined, isArray, isString, isNumber, isBoolean, isObject, isNull, isJson, isEmpty } = require("./generic");

const Local = {
    get: (key, val = "") => {
        const data = window.localStorage.getItem(key) || val;
        return isJson(data) ? JSON.parse(data) : data;
    },
    set: (key, val = "") => {
        val = isArray(val) || isObject(val) ? JSON.stringify(val) : String(val);
        return window.localStorage.setItem(key, val) || val;
    },
    del: (key, val = "") => window.localStorage.removeItem(key) || val,
};

const Session = {
    get: (key, val = "") => {
        const data = window.sessionStorage.getItem(key) || val;
        return isJson(data) ? JSON.parse(data) : data;
    },
    set: (key, val = "") => {
        val = isArray(val) || isObject(val) ? JSON.stringify(val) : String(val);
        return window.sessionStorage.setItem(key, val) || val;
    },
    del: (key, val = "") => window.sessionStorage.removeItem(key) || val,
};

const Cookie = {
    get: (key, val = "") => {
        key = key + "=";
        const cks = decodeURIComponent(document.cookie).split(";");
        for (let i = 0; i < cks.length; i++) {
            let ck = cks[i];
            // triming space
            while (ck.charAt(0) === " ") ck = ck.substring(1);
            // picking value
            if (ck.indexOf(key) === 0) return ck.substring(key.length, ck.length);
        }
        return val;
    },
    set: (key, val = "", exp = 1) => {
        const d = new Date();
        d.setTime(d.getTime() + exp * 60 * 60 * 1e3); // exp in hours
        document.cookie = key.concat("=", val, ";expires=", d.toUTCString(), "; path=/");
    },
    del: (key, val = "") => this.set(key, val, -1e3),
};

module.exports = {
    Local,
    Session,
    Cookie,
};
