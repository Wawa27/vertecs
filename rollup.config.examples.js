import ts from "rollup-plugin-ts";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
    ...["Basic", "Rotation", "Tower"].map((name) => ({
        input: `./examples/rapier/${name}.ts`,
        output: {
            file: `dist/examples/rapier/${name.toLowerCase()}.js`,
            format: "esm",
        },
        plugins: [ts(), resolve({ browser: true }), commonjs()],
    })),
    {
        input: ["./examples/three/HelloCube.ts"],
        output: {
            file: "dist/examples/three/hello-cube.js",
            format: "esm",
        },
        plugins: [
            ts(),
            resolve({
                browser: true,
            }),
            commonjs(),
        ],
    },
];
