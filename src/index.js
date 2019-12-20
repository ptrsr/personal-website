import './style.css';
import Context from './globe/context.js';
import DevInterface from './dev-interface.js';
import Fullscreen from './aux/fullscreen.js'

import settings from '../assets/settings.json';


const header = document.getElementsByTagName('header')[0];
const name = document.getElementById('name');

function onFullscreenChange(isFullscreen) {
    context.toggleControls(!isFullscreen);
    name.setAttribute('class', isFullscreen ? 'fade-out' : 'fade-in');
}

const fullscreen = new Fullscreen(header, onFullscreenChange);

const canvas = document.getElementById('globe');
canvas.fullscreen = fullscreen;

const context = new Context(canvas, settings);
context.start();

if (process.env.NODE_ENV === 'development') {
    new DevInterface(settings, context.state);
}
