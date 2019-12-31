import './style.css';
import Context from './globe/context.js';
import DevInterface from './dev-interface.js';
import Fullscreen from './aux/fullscreen.js'

import settings from '../assets/settings.json';
import { TextureLoader, RepeatWrapping } from 'three'
import PointGen from './aux/point-gen';

const header = document.getElementsByTagName('header')[0];
const name = document.getElementById('name');

function onFullscreenChange(isFullscreen) {
    context.toggleControls(!isFullscreen);
    name.setAttribute('class', isFullscreen ? 'fade-out' : 'fade-in');
}

const fullscreen = new Fullscreen(header, onFullscreenChange);

const canvas = document.getElementById('globe');
canvas.fullscreen = fullscreen;

const fullscreenButton = document.getElementById('fullscreen');
fullscreenButton.onclick = fullscreen.toggle;


// textures
const loader = new TextureLoader();

let textures;
const image = new Promise((resolve) => {
    textures = {
        day: loader.load('public/earth/earth-day.jpg'),
        aux: loader.load('public/earth/earth-aux.jpg', resolve)
    }
    textures.day.wrapS = RepeatWrapping;
    textures.aux.wrapS = RepeatWrapping;
});


const context = new Context(canvas, settings, textures);
context.start();

if (process.env.NODE_ENV === 'development') {
    new PointGen(image);
    new DevInterface(settings, context.state);
}
