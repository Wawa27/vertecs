import { ShaderMaterial } from "three";
import { IUniform } from "three/src/renderers/shaders/UniformsLib";
import { Component } from "../../core";

export default abstract class ThreeShaderComponent extends Component {
    public readonly material: ShaderMaterial;

    public readonly uniforms: { [uniform: string]: IUniform };

    protected constructor(
        vertexShader: string | undefined,
        fragmentShader: string | undefined,
        uniforms?: { [uniform: string]: IUniform }
    ) {
        super();
        this.uniforms = uniforms ?? {};
        this.material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
        });
    }
}
