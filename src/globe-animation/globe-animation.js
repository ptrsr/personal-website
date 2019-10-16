import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'
import { OrbitControls } from './orbit-controls.js'
import SVGLoader from './svg-loader.js'

import Globe from './globe.js'


// import { Loader, Vector2, FileLoader, ShapePath, Path, Matrix3, BufferGeometry, Float32BufferAttribute } from 'three';


export default class GlobeAnimation {
    constructor(canvas) {
        // create empty scene
        const scene = new Scene();

        // setup camera
        const camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 3);
        
        // setup renderer
        const renderer = new WebGLRenderer({ canvas });
        renderer.setClearColor(new Color('black'));
        
        // update screen resolution
        window.addEventListener( 'resize', this.onWindowResize.bind(null, camera, renderer), false);
        window.dispatchEvent(new Event('resize'));
        
        // instantiate globe
        const globe = new Globe(0.5);
        globe.SetSun(Date.now());
        scene.add(globe);
        
        // setup controls
        const controls = new OrbitControls(camera);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.enablePan = false;

        // start loop
        const clock = new Clock(true);
        this.loop({ scene, clock, controls, renderer, camera });

        const loader = new SVGLoader();

        loader.load('/assets/map.svg', 
            function(data) {console.log(data)},
            function(xhr) {console.log("loading...")},
            function(error) {console.error(error)}
        );
    }


    loop = (objects) => {
        objects.controls.update();
        objects.renderer.render(objects.scene, objects.camera);

        // setTimeout(this.loop, 1, clock, counter);

        requestAnimationFrame(this.loop.bind(null, objects));
    }

    onWindowResize = (camera, renderer) => {
        const canv = renderer.domElement;

        const width = canv.clientWidth;
        const height = canv.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(canv.clientWidth, canv.clientHeight, false);
     }
}
