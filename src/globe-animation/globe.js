import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader } from "three";

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

        const dayMap1 = new TextureLoader().load('assets/earth/day-map1.jpg');
        const dayMap2 = new TextureLoader().load('assets/earth/day-map2.jpg');

        const normalMap1 = new TextureLoader().load('assets/earth/normal-map1.jpg');
        const normalMap2 = new TextureLoader().load('assets/earth/normal-map2.jpg');

        const combinedMap1 = new TextureLoader().load('assets/earth/combined-map1.jpg');
        const combinedMap2 = new TextureLoader().load('assets/earth/combined-map2.jpg');
        
        // globe shader
        const material = new RawShaderMaterial({
            uniforms: { 
                invViewMatrix: { value: new Matrix4() },
                size: { value: 1 },
                dayMap1: { type: 't', value: dayMap1 },
                dayMap2: { type: 't', value: dayMap2 },
                normalMap1: { type: 't', value: normalMap1 },
                normalMap2: { type: 't', value: normalMap2 },
                combinedMap1: { type: 't', value: combinedMap1 },
                combinedMap2: { type: 't', value: combinedMap2 },

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

    setSphereSize = (size) => {
        this.material.uniforms.size.value = size;
    }
}
