const data1 = {
    one: [
        {
            a: [{ x: 1 }, { x: 2 }],
            b: 123,
        },
        {
            a: [{ x: 3 }, { x: 4 }],
            b: 785,
            c: 368,
        },
    ],
};
const data2 = [
    {
        name: "a1",
        b: [
            {
                name: "b1",
                c: [{ name: "c1" }, { name: "c2" }],
            },
            {
                name: "b2",
                c: [{ name: "c3" }, { name: "c4" }],
            },
        ],
    },
    {
        name: "a2",
        b: [
            {
                name: "b3",
                c: [{ name: "c4" }, { name: "c5" }],
            },
            {
                name: "b4",
                c: [{ name: "c6" }, { name: "c7" }],
            },
        ],
    },
];

function unwind(input, path) {
    if (typeof path === "string") return unwind(input, path.split("."));

    // input is array
    if (Array.isArray(input)) {
        if (path.length === 1) {
            const arr = [];
            for (const i of input) {
                const k = path[0];
                if (Array.isArray(i[k])) {
                    for (const j of i[k]) {
                        arr.push(Object.assign({}, i, { [k]: j }));
                    }
                } else {
                    arr.push(i);
                }
            }
            return arr;
        }

        return unwind(input, path[0]);
    }

    // if input is object
    if (String(input) === "[object Object]") {
        return unwind([input], path);
    }

    return null;
}

let out = "";
// out = unwind(data1, "one.a");
out = unwind(data2, "b.c");
console.log(JSON.stringify(out, null, 2));
