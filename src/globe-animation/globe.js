import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader } from "three";
import { LinearFilter } from "three";


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

        const dayTex = new TextureLoader().load('assets/earth/earth-day.jpg');
        const auxTex = new TextureLoader().load('assets/earth/earth-aux.jpg');
        const nrmTex = new TextureLoader().load('assets/earth/earth-nrm.jpg');
        
        // disable mipmapping due to issue with a seam
        dayTex.minFilter = LinearFilter;
        auxTex.minFilter = LinearFilter;
        nrmTex.minFilter = LinearFilter;

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: { 
                invViewMatrix: { value: new Matrix4() },
                size: { value: 1 },
                dayTex: { type: 't', value: dayTex },
                auxTex: { type: 't', value: auxTex },
                nrmTex: { type: 't', value: nrmTex },

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
