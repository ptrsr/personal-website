
import {CubeCamera, PlaneGeometry, Mesh, Scene, RawShaderMaterial } from 'three'

import starsVertShader from './shaders/stars.vs'
import starsFragShader from './shaders/stars.fs'

export default class Stars {
    constructor(renderer, resolution = 1000) {
        // create plane with star shader attached
        const geometry = new PlaneGeometry(2, 2);
        
        const material = new RawShaderMaterial({
            vertexShader: starsVertShader,
            fragmentShader: starsFragShader
        });
        const object = new Mesh(geometry, material);
        object.frustumCulled = false;

        // ThreeJS requires a scene in order to render
        const scene = new Scene();
        scene.add(object);

        const camera = new CubeCamera(0.1, 20, resolution);
        
        // render 
        camera.update(renderer, scene);
        this.cube = camera.renderTarget;
    }
}
