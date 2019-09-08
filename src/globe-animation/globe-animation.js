import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'
import { Object3D } from 'three'

import Globe from './globe.js'




export default class GlobeAnimation {
    constructor(canvas) {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(60, canvas.scrollWidth / canvas.scrollHeight, 0.1, 1000);

        this.objc = new Object3D();
        const objf = new Object3D();
        
        this.scene.add(this.objc);
        objf.position.z = 4;
        this.objc.add(objf);
        objf.add(this.camera);

        
        const globe = new Globe();
        this.scene.add(globe);

        globe.setSphereSize(1)

        this.renderer = new WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.setSize(canvas.scrollWidth, canvas.scrollHeight);
        this.renderer.setClearColor(new Color('black'));
        this.renderer.setPixelRatio( window.devicePixelRatio );

        const clock = new Clock(true);
        this.loop(clock);
    }


    loop = (clock) => {
        const delta = clock.getDelta();
        this.camera.position.y = Math.sin(clock.elapsedTime);

        this.renderer.render(this.scene, this.camera);
        this.objc.rotateY(delta);
        requestAnimationFrame(this.loop.bind(null, clock));
    }


}

