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

