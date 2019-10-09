import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader, Vector3 } from "three";
import { RepeatWrapping } from "three";


import vert from './shaders/globe.vs'
import frag from './shaders/globe.fs'

export default class Globe extends Mesh {
    constructor(scale = 1) {
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

        // load textures
        const dayTex = new TextureLoader().load('assets/earth/earth-day.jpg');
        const auxTex = new TextureLoader().load('assets/earth/earth-aux.jpg');
        const nrmTex = new TextureLoader().load('assets/earth/earth-nrm.jpg');
        
        dayTex.wrapS = RepeatWrapping;
        auxTex.wrapS = RepeatWrapping;
        nrmTex.wrapS = RepeatWrapping;


        // get sun position
        const start = Date.UTC(2000, 0, 1, 12);
        let days = (Date.now() - start) / 8.64e+7; // milliseconds to days
        console.log("days:" + days)
        

        const l = 4.89495042 + 0.0172027923937 * days;
        const g = 6.240040768 + 0.0172019703436 * days;
        const longitude = l + (0.033423055 * Math.sin(g)) + (0.0003490659 * Math.sin(2*g));

        const test = Date.now();
        console.log((test / 8.64e+7) % 1)
        let latitude = ((test / 8.64e+7) % 1) * -2 * Math.PI;

        const sunPos = new Vector3(-Math.sin(latitude), 0, -Math.cos(latitude));
        // globe shader
        const material = new RawShaderMaterial({
            uniforms: {
                lDir: { value: sunPos },
                invViewMatrix: { value: new Matrix4() },
                scale: { value: scale },
                dayTex: { type: 't', value: dayTex },
                auxTex: { type: 't', value: auxTex },
                nrmTex: { type: 't', value: nrmTex },

            },
            vertexShader: vert,
            fragmentShader: frag
        });

        // mesh constructor
        super(geometry, material);
        
        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }
}
