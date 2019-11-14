import './style.css';
import Context from './globe/context.js';
import DevInterface from './dev-interface.js';

import settings from '../assets/settings.json';

const canvas = document.getElementById('globe');

const context = new Context(canvas, settings);
context.start();

if (process.env.NODE_ENV === 'development') {
    new DevInterface(settings, context.state);
}

const fullscreenButton = document.getElementById('fullscreen');
const header = document.getElementsByTagName('header')[0];

fullscreenButton.onclick = toggleFullcreen.bind(fullscreenButton, header);
function toggleFullcreen(element) {
    const isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

	element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
	document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };

    isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
    
    this.innerHTML = isFullscreen ? 'fullscreen' : 'fullscreen_exit';
}