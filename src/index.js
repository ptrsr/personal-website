import './style.css';
import Context from './globe-animation/context.js';


const canvas = document.getElementById('globe');
const context = new Context(canvas);
context.start();
