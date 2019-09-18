import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'
import { Object3D } from 'three'

import Globe from './globe.js'


export default class GlobeAnimation {
    constructor(canvas) {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.objc = new Object3D();
        const objf = new Object3D();
        
        this.scene.add(this.objc);
        objf.position.z = 4;
        this.objc.add(objf);
        objf.add(this.camera);

        
        const globe = new Globe();
        this.scene.add(globe);

        globe.setSphereSize(1);

        this.renderer = new WebGLRenderer({ canvas });

        // this.renderer.antialias = true;

        this.renderer.setClearColor(new Color('black'));

        this.onWindowResize();

        const clock = new Clock(true);

        const counter = document.getElementById('fps');

        this.loop(clock, counter);

        window.addEventListener( 'resize', this.onWindowResize, false );
    }


    loop = (clock, counter) => {
        const delta = clock.getDelta();
        // this.camera.position.y = Math.sin(clock.elapsedTime);

        //counter.innerHTML = 1 / delta;
        this.objc.rotateY(delta / 3.0);

        this.renderer.render(this.scene, this.camera);


        // setTimeout(this.loop, 1, clock, counter);

        requestAnimationFrame(this.loop.bind(null, clock, counter));
    }

    onWindowResize = () => {
        const canv = this.renderer.domElement;

        const pixelRatio = window.devicePixelRatio;

        const width = canv.clientWidth;
        const height = canv.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(canv.clientWidth, canv.clientHeight, false);

     
     }


}

