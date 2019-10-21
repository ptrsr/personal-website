import { Mesh, PlaneGeometry, RawShaderMaterial, Quaternion, Euler, Matrix4, Vector3 } from 'three'

import sphereVertShader from './shaders/sphere.vs'
import sunFragShader from './shaders/sun.fs'

import SunCalc from 'suncalc';

export default class Sun extends Mesh {
    constructor(date = 0) {
        const geometry = new PlaneGeometry(2, 2);

        const material = new RawShaderMaterial({
            uniforms: {
                invViewMatrix: { value: new Matrix4() },
                scale: { value: 0.5 },

            },
            vertexShader: sphereVertShader,
            fragmentShader: sunFragShader,
            transparent: true
        });

        super(geometry, material);
        this.SetDate(date);

        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    SetDate = (date) => {
        const sunPos = SunCalc.getPosition(date, 90, 0);

        const q = new Quaternion().setFromEuler(new Euler(-sunPos.altitude, -sunPos.azimuth, 0));
        const dir = new Vector3(0,0,1).applyQuaternion(q);
        this.position.copy(dir);
        this.dir = dir;
    }
}
