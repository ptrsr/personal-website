import { Color, WebGLRenderer, Scene, PerspectiveCamera, Clock, Object3D, Math as TMath, Vector3 } from 'three'

import OrbitControls from '../aux/orbit-controls.js'
import FPSCounter from '../aux/fps-counter.js'
import EventHandler from '../aux/event-handler.js'

import Globe from './globe.js'
import Sun from './sun.js'
import Dolly from './dolly.js'
import Overlay from './overlay.js'

import createStars from './stars.js'

function loop(state) {
    if (!state.settings.looping) {
        return;
    }
    // call all updatable functions
    const deltaTime = state.clock.getDelta();
    for (let [key, func] of Object.entries(state.updateables)) {
        stop = func(state, deltaTime);
        // remove the updatable function if returns false to stop it from looping
        if (stop === false) {
            delete state.updateables[key];
        }
    };
    // render
    state.renderer.render(state.scene, state.objects.camera);

    // call next loop with current state
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

    // context state
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
            interactive: true,
            looping: false
        }
    }
}

function onWindowResize(camera, renderer) {
    const canvas = renderer.domElement;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const mat = camera.projectionMatrix;

    // final zoom is based the shortest canvas dimension length
    const zoom = Math.min(width, height) / camera.zoom;

    // scale the camera projection based on zoom and resolution
    mat.elements[0] = (zoom / width);
    mat.elements[5] = (zoom / height);

    // used for raycasting from screen space
    camera.projectionMatrixInverse.getInverse(mat);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
 }

export default class Context {
    constructor(canvas, settings, textures) {
        // create 3D environment
        const state = init(canvas, settings);

        // allows events to access the state
        state.handler = new EventHandler(canvas, state);

        // fps
        const fps = new FPSCounter(document.body);
        state.updateables.record = fps.record;

        // sun
        const sun = new Sun(Date.now());
        state.scene.add(sun);

        // instantiate globe
        const globe = new Globe(settings.globe, textures);
        
        // state.handler.addListener('touchend', globe.onClickUp);
        // state.handler.addListener('mouseup', globe.onClickUp);

        // globe overlay
        const digital = new Overlay(4, 5, textures.aux);
        state.handler.addListener('mousedown', digital.onClickDown);
        state.handler.addListener('touchstart', digital.onClickDown);
        state.scene.add(digital);

        // state.handler.addListener('touchstart', globe.onClick);
        state.scene.add(globe);
        globe.setSunDir(sun.dir);

        // stars
        state.scene.background = createStars(state.renderer, 1500);

        // add globe and sun to objects
        Object.assign(state.objects, { globe, sun });

        // save state in context
        this.state = state;
    }

    start = () => {
        this.state.settings.looping = true;
        this.state.clock.start();

        // start looping
        loop(this.state);
    }

    stop = () => {
        // stops after current loop
        this.state.settings.looping = false;

        this.state.clock.stop();
    }

    toggleControls(enable = !this.state.settings.interactive) {
        // save state in settings
        this.state.settings.interactive = enable;
        
        // toggle the input listeners of the controls
        this.state.controls.setListeners(!enable);

        // set canvas to fore or background
        this.state.canvas.style['z-index'] = enable ? -1 : 0;

        // idle rotation when in background
        this.state.controls.autoRotate = enable;
        
        // move the dolly between start and end 
        const dolly = this.state.objects.dolly.goTo(enable ? 1 : 0);

        // dolly animation if movement is required
        if (Boolean(dolly)) {
            this.state.updateables.dolly = dolly;
        }
    }
}
