const { dateMs, timeAgo, calcAge, calcKms } = require("../src");

describe("testing [dateMs]", () => {
    test("human-friendly-str to milliseconds", () => {
        const items = {
            "1000ms": 1000,
            "60s": 60000,
            "-330min": -19800000,
            "4.2hours": 15120000,
            "1 day": 86400000,
            "5.week": 3024000000,
            "2 years": 63115200000,
        };

        for (const key in items) {
            const val = items[key];

            expect(dateMs(key)).toBe(val);
        }
    });

    test("human-friendly-str to milliseconds in past", () => {
        const items = {
            "1000ms": 1000,
            "60s": 60000,
            "-330min": -19800000,
            "4.2hours": 15120000,
            "1 day": 86400000,
            "5.week": 3024000000,
            "2 years": 63115200000,
        };

        for (const key in items) {
            const val = items[key];

            expect(dateMs(key + ".ago") / 1000).toBeCloseTo((Date.now() - val) / 1000);
        }
    });

    test("human-friendly-str to milliseconds in future", () => {
        const items = {
            "1000ms": 1000,
            "60s": 60000,
            "-330min": -19800000,
            "4.2hours": 15120000,
            "1 day": 86400000,
            "5.week": 3024000000,
            "2 years": 63115200000,
        };

        for (const key in items) {
            const val = items[key];

            expect(dateMs(key + ".ahead") / 1000).toBeCloseTo((Date.now() + val) / 1000);
        }
    });
});

describe("testing [timeAgo]", () => {
    test("sha256 sync function", () => {
        const items = {};

        for (const key in items) {
            const val = items[key];

            expect(sha256(val)).toBe(key);
        }
    });
});
describe("testing [calcAge]", () => {
    test("hexEncode sync function", () => {
        const items = {};

        for (const key in items) {
            const val = items[key];

            expect(hexEncode(val)).toBe(key);
        }
    });
});
describe("testing [calcKms]", () => {
    test("hexDecode sync function", () => {
        const items = {};

        for (const key in items) {
            const val = items[key];

            expect(hexDecode(val)).toBe(key);
        }
    });
});
