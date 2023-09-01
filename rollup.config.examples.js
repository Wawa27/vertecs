import ts from "rollup-plugin-ts";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
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
    {
        input: ["./examples/oimo/Basic.ts"],
        output: {
            file: "dist/examples/oimo/basic.js",
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
    {
        input: ["./examples/oimo/Boilerplate.ts"],
        output: {
            file: "dist/examples/oimo/boilerplate.js",
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
    {
        input: ["./examples/oimo/Rotation.ts"],
        output: {
            file: "dist/examples/oimo/rotation.js",
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
    {
        input: ["./examples/oimo/Tower.ts"],
        output: {
            file: "dist/examples/oimo/tower.js",
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
