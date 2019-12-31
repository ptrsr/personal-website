precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

varying vec3 cameraSpacePosition;
varying vec3 normal;

void main() {
    // normal is that of the sphere surface
    normal = normalize(position);

    vec4 intermediatePosition = modelViewMatrix * vec4(position, 1);
    cameraSpacePosition = intermediatePosition.xyz;

    gl_Position = projectionMatrix * intermediatePosition;
}
