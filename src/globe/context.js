import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock } from 'three'

import OrbitControls from '../aux/orbit-controls.js'
import FPSCounter from '../aux/fps-counter.js'

import Globe from './globe.js'
import Sun from './sun.js'
import CreateStars from './stars.js'

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
    const camera = new PerspectiveCamera(
        settings.camera.fov, 
        window.innerWidth / window.innerHeight, 
        settings.camera.near, 
        settings.camera.far
    );
    {
        camera.position.set(0, 0, settings.camera.controls.distance.start);
    }
    
    // setup renderer
    const renderer = new WebGLRenderer({ canvas, antialias: false });
    renderer.setClearColor(new Color('black'));
    renderer.setPixelRatio(window.devicePixelRatio);

    // update screen resolution
    window.addEventListener( 'resize', onWindowResize.bind(null, camera, renderer), false);
    window.dispatchEvent(new Event('resize'));

    // setup controls
    const controls = new OrbitControls(camera, canvas, settings.camera.controls);

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

        canvas.onmouseout = function() {
            console.log('no')
        }

        const state = init(canvas, settings);

        const counter = new FPSCounter(document.body);
        state.updateables.push(counter.record);

        // sun
        const sun = new Sun(Date.now());
        state.scene.add(sun);

        // instantiate globe
        const globe = new Globe(settings.globe);
        state.scene.add(globe);
        globe.setSunDir(sun.dir);
        // globe.loadBorders('/public/map.svg');

        // stars
        state.scene.background = CreateStars(state.renderer, 1500);

        state.objects = { globe, sun };

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
