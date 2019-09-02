import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh } from "three";

import vert from './shaders/globe.vs'
import frag from './shaders/globe.fs'

export default class Globe extends Mesh {
    constructor() {
        // simple plane geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute("vertexPos", new Float32BufferAttribute([
             100,  100, 0,  // TR
            -100,  100, 0,  // TL
            100,  -100, 0,  // BR
            -100, -100, 0], // BL
            3)
        );
        geometry.setIndex([ 0, 1, 2, 1, 3, 2 ]);

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: { invViewMatrix: { value: new Matrix4() }, },
            vertexShader: vert,
            fragmentShader: frag
        });

        super(geometry, material);

        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }
}
