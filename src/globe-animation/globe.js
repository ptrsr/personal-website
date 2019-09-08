import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, Vector3 } from "three";

import vert from './shaders/globe.vs'
import frag from './shaders/globe.fs'

export default class Globe extends Mesh {
    constructor(size = 1) {
        // simple plane geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute("vertexPos", new Float32BufferAttribute([
             1,  1, 0,  // TR
            -1,  1, 0,  // TL
             1, -1, 0,  // BR
            -1, -1, 0], // BL
            3)
        );
        geometry.setIndex([ 0, 1, 2, 1, 3, 2 ]);

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: { 
                invViewMatrix: { value: new Matrix4() },
                size: { value: 1 },
                pSize: { value: 1.1 }
            },
            vertexShader: vert,
            fragmentShader: frag
        });

        super(geometry, material);
        this.size = size;

        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    setPlaneSize = (size) => {
        this.material.uniforms.pSize.value = size;
    }

    setSphereSize = (size) => {
        this.material.uniforms.size.value = size;
    }
}
