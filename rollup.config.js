import ts from "rollup-plugin-ts";

export default [
    {
        input: ["./src/index.ts"],
        output: {
            file: "dist/index.cjs",
            format: "cjs",
        },
        plugins: [ts()],
    },
    {
        input: ["./src/index.ts"],
        output: {
            file: "dist/index.mjs",
            format: "esm",
        },
        plugins: [ts()],
    },
];
