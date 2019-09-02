import './style.css';
import globeAnimation from './globe-animation/globe-animation.js';


const canvas = document.getElementById('globe');
const globe = new globeAnimation(canvas);

console.log(globe);