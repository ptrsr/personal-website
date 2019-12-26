import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock, Object3D, Math as TMath, Vector3 } from 'three'

import OrbitControls from '../aux/orbit-controls.js'
import FPSCounter from '../aux/fps-counter.js'
import EventHandler from '../aux/event-handler.js'

import Globe from './globe.js'
import Sun from './sun.js'
import CreateStars from './stars.js'
import Dolly from './dolly.js'
import Digital from './digital.js'

function loop(state) {
    if (!state.settings.looping) {
        return;
    }
    // call all updatable functions
    const deltaTime = state.clock.getDelta();
    for (let [key, func] of Object.entries(state.updateables)) {
        stop = func(state, deltaTime);

        if (stop === false) {
            delete state.updateables[key];
        }
    };

    state.renderer.render(state.scene, state.objects.camera);
    requestAnimationFrame(loop.bind(null, state));
}

function init(canvas, settings) {
    // create empty scene
    const scene = new Scene();
    
    // setup camera
    const dolly = new Dolly(new Vector3(0, -0.5, 0), 1);
    const camera = new PerspectiveCamera();
    camera.zoom = settings.camera.zoom / window.devicePixelRatio;

    dolly.add(camera);
    
    // set offset for text allignment
    const orbit = new Object3D();
    orbit.position.set(0, 0, settings.camera.distance.start * (1 + (window.devicePixelRatio - 1) / 2));
    scene.add(orbit);
    orbit.add(dolly);
    
    camera.rotateY(180 * TMath.DEG2RAD);
    
    // setup renderer
    const renderer = new WebGLRenderer({ canvas, antialias: false });
    renderer.setClearColor(new Color('black'));
    renderer.setPixelRatio(window.devicePixelRatio);

    // update screen resolution
    window.addEventListener('resize', onWindowResize.bind(null, camera, renderer), false);
    window.dispatchEvent(new Event('resize'));

    // setup controls
    const controls = new OrbitControls(orbit, canvas, settings.camera);

    // auxiliary
    const clock = new Clock(false);

    return {
        scene, clock, controls, renderer, canvas,
        objects: {
          camera,
          dolly
        },
        updateables: {
            controls: controls.update 
        },
        settings: {
            background: true,
            looping: false
        }
    }
}

function onWindowResize(camera, renderer) {
    const canvas = renderer.domElement;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const mat = camera.projectionMatrix;

    const zoom = Math.min(width, height) / camera.zoom;

    mat.elements[0] = (zoom / width);
    mat.elements[5] = (zoom / height);

    camera.projectionMatrix = mat;

    // this is used for raycasting from screen space
    camera.projectionMatrixInverse.getInverse(mat);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
 }

export default class Context {
    constructor(canvas, settings, textures) {

        const state = init(canvas, settings);
        state.handler = new EventHandler(canvas, state);

        const counter = new FPSCounter(document.body);
        state.updateables.record = counter.record;

        // sun
        const sun = new Sun(Date.now());
        state.scene.add(sun);

        // instantiate globe
        const globe = new Globe(settings.globe, textures);
        
        // state.handler.addListener('touchend', globe.onClickUp);
        // state.handler.addListener('mouseup', globe.onClickUp);


        const digital = new Digital(3, 13, textures.aux);
        state.handler.addListener('mousedown', digital.onClickDown);
        state.handler.addListener('touchstart', digital.onClickDown);
        state.scene.add(digital);

        // state.handler.addListener('touchstart', globe.onClick);
        state.scene.add(globe);
        globe.setSunDir(sun.dir);


        // stars
        state.scene.background = CreateStars(state.renderer, 1500);

        Object.assign(state.objects, { globe, sun });
        this.state = state;
    }

    start = () => {
        this.state.settings.looping = true;
        this.state.clock.start();
        loop(this.state);
    }

    stop = () => {
        this.state.settings.looping = false;
        this.state.clock.stop();
    }

    toggleControls(enable) {
        if (enable == undefined) {
            enable = !this.state.settings.background;
        }

        this.state.controls.setListeners(!enable);

        this.state.controls.autoRotate = enable;
        this.state.canvas.style['z-index'] = enable ? -1 : 0;

        this.state.settings.background = enable;

        const dolly = this.state.objects.dolly.goTo(enable ? 1 : 0);
        if (Boolean(dolly)) {
            this.state.updateables.dolly = dolly;
        }
    }
}
