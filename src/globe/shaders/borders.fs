precision highp float;

uniform float timer;
uniform vec3 hitPos;

varying vec3 normal;

#pragma glslify: uvMap = require('./aux/uv.glsl')

void main() {
    float dist = acos(dot(normalize(hitPos), normalize(normal)));

    float range = step(dist, timer * PI);

    vec2 uv = uvMap(normal);

    gl_FragColor = vec4(vec3(1), range);
}
