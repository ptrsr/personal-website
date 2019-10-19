import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'

import OrbitControls from '../aux/orbit-controls.js'
import SVGLoader from '../aux/svg-loader.js'
import FPSCounter from '../aux/fps-counter.js'

import Globe from './globe.js'


function loop(state) {
    if (!state.looping) {
        return;
    }
    // call all updatable functions
    const deltaTime = state.clock.getDelta();
    for (let i = 0; i < state.updateables.length; i++) {
        state.updateables[i](deltaTime);
    }
    state.renderer.render(state.scene, state.camera);
    requestAnimationFrame(loop.bind(null, state));
}

function init(canvas, settings) {
    // create empty scene
    const scene = new Scene();

    // setup camera
    const camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);

    // setup renderer
    const renderer = new WebGLRenderer({ canvas });
    renderer.setClearColor(new Color('black'));
    renderer.setPixelRatio(window.devicePixelRatio);

    // update screen resolution
    window.addEventListener( 'resize', onWindowResize.bind(null, camera, renderer), false);
    window.dispatchEvent(new Event('resize'));

    // setup controls
    const controls = new OrbitControls(camera);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;

    const clock = new Clock(false);

    return { scene, clock, controls, renderer, camera, 
        updateables: [ controls.update ],
        looping: false };
}

function onWindowResize (camera, renderer) {
    const canv = renderer.domElement;

    const width = canv.clientWidth;
    const height = canv.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(canv.clientWidth, canv.clientHeight, false);
 }

export default class Context {
    constructor(canvas, settings) {
        const state = init(canvas, settings);

        const counter = new FPSCounter(document.body);
        state.updateables.push(counter.record);

        // instantiate globe
        const globe = new Globe(0.5);
        globe.setSunPos(Date.now());
        state.scene.add(globe);

        new SVGLoader().load('/assets/map.svg', 
            globe.loadBorders.bind(null, state.scene),
            function(xhr) {console.log("loading...")},
            function(error) {console.error(error)}
        );

        this.state = state;
    }

    start = () => {
        this.state.looping = true;
        this.state.clock.start();
        loop(this.state);
    }

    stop = () => {
        this.state.looping = false;
        this.state.clock.stop();
    }
}
