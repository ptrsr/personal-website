precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float test;

varying float fCol;
varying vec3 normal;


void main() {
    fCol = test;

    normal = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
