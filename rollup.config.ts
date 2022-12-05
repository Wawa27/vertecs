import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default {
    input: "./examples/three/HelloCube.ts",
    output: {
        file: "./build/three/HelloCube.js",
        format: "es",
    },
    plugins: [
        nodeResolve({
            browser: true,
        }),
        typescript(),
        commonjs(),
        nodePolyfills(/* options */),
    ],
};
