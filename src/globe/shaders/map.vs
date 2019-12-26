precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

varying vec3 normal;

void main() {
    // normal is that of the sphere surface
    normal = normalize(position);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}
