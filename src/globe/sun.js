import { Mesh, PlaneGeometry, RawShaderMaterial, Quaternion, Euler, Matrix4, Vector3 } from 'three'

import sunVertShader from './shaders/sun.vs'
import sunFragShader from './shaders/sun.fs'

import SunCalc from 'suncalc';

export default class Sun extends Mesh {
    constructor(date = 0, scale = 1) {


        const geometry = new PlaneGeometry(1, 1);

        const material = new RawShaderMaterial({
            uniforms: {
                invViewMatrix: { value: new Matrix4() },

            },
            vertexShader: sunVertShader,
            fragmentShader: sunFragShader,
            transparent: true
        });

        super(geometry, material);
        this.SetPosition(date, scale);
        this.scale.copy(new Vector3(1, 1, 1).multiplyScalar(scale * 109.17 * 60));

        this.frustumCulled = false;

        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    SetPosition = (date, scale) => {
        const sunPos = SunCalc.getPosition(date, 90, 0);

        const q = new Quaternion().setFromEuler(new Euler(-sunPos.altitude, -sunPos.azimuth, 0));
        const dir = new Vector3(0,0,1).applyQuaternion(q);
        this.position.copy(new Vector3(0, 1, 0));
        this.position.copy(dir.clone().multiplyScalar(0.5 * scale * 11694));
        // this.position.copy(dir * 137040 * 0.5 * scale);

        this.dir = dir;
    }
}
