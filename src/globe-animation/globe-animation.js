import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'
import { Object3D } from 'three'
import { OrbitControls } from './orbit-controls.js'

import Globe from './globe.js'

export default class GlobeAnimation {
    constructor(canvas) {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);

        const globe = new Globe(0.5);
        this.scene.add(globe);
        
        this.renderer = new WebGLRenderer({ canvas });
        
        this.controls = new OrbitControls(this.camera);
        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        // this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        // this.controls.maxPolarAngle = Math.PI / 2;

        this.controls.update();


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
        // this.objc.rotateY(delta / 3.0);


        this.controls.update();
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

