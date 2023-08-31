import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default {
    input: [
        "./examples/three/HelloCube.ts",
        "./examples/oimo/Basic.ts",
        "./examples/oimo/Rotation.ts",
        "./examples/oimo/Tower.ts",
        "./examples/network/pong/client/Main.ts",
    ],
    output: {
        dir: "./dist/",
        format: "es",
        preserveModules: true,
        preserveModulesRoot: "./",
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
