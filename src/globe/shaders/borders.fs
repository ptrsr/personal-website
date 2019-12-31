precision highp float;

uniform float timer;
uniform vec3 hitPos;
uniform mat4 modelViewMatrix;

varying vec3 normal;
varying vec3 cameraSpacePosition;

#pragma glslify: uvMap = require('./aux/uv.glsl')

void main() {
    float dist = acos(dot(normalize(hitPos), normalize(normal)));

    float range = step(dist, timer * PI);

    vec2 uv = uvMap(normal);

    vec3 pos = normalize(cameraSpacePosition - modelViewMatrix[3].xyz);
    float cull = step(dot(pos, normalize(cameraSpacePosition)), 0.0);

    // vec3 relNormal = modelMatrix * normal;

    float edge = 1.0 - pow(max(0.0, 1.0 - (timer * PI - dist)), 10.);

    gl_FragColor = vec4(1, 1, edge, range * cull);
}
