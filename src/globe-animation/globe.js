import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader, Vector3, Quaternion, Euler } from "three";
import { RepeatWrapping } from "three";
import SunCalc from 'suncalc';


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

        const loader = new TextureLoader();
        // load textures
        const dayTex = loader.load('assets/earth/earth-day.jpg');
        const auxTex = loader.load('assets/earth/earth-aux.jpg');
        const nrmTex = loader.load('assets/earth/earth-nrm.jpg');
        
        dayTex.wrapS = RepeatWrapping;
        auxTex.wrapS = RepeatWrapping;
        nrmTex.wrapS = RepeatWrapping;


        // globe shader
        const material = new RawShaderMaterial({
            uniforms: {
                lDir: { value: new Vector3() },
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

    SetSun = (date) => {
        const test = SunCalc.getPosition(date, 90, 0);

        const q = new Quaternion().setFromEuler(new Euler(-test.altitude, -test.azimuth, 0));
        const dir = new Vector3(0,0,1).applyQuaternion(q);

        this.material.uniforms.lDir.value = dir;
    }
}
