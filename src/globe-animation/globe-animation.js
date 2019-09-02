import { Color, WebGLRenderer, Scene, PerspectiveCamera } from 'three'
import { Object3D } from 'three'

import Globe from './globe.js'




export default class GlobeAnimation {
    constructor(canvas) {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, canvas.scrollWidth / canvas.scrollHeight, 0.1, 1000);

        this.objc = new Object3D();
        const objf = new Object3D();
        
        this.scene.add(this.objc);
        objf.position.z = 400;
        this.objc.add(objf);
        objf.add(this.camera);

        
        const globe = new Globe();
        console.log(globe);
        this.scene.add(globe);


        this.renderer = new WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.setSize(canvas.scrollWidth, canvas.scrollHeight);
        this.renderer.setClearColor(new Color('black'));
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.loop();        
    }


    loop = () => {
        this.renderer.render(this.scene, this.camera);
        this.objc.rotateY(0.01);
        requestAnimationFrame(this.loop);
    }


}

