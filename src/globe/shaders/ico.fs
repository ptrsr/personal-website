precision highp float;

uniform float timer;
uniform vec3 hitPos;
uniform mat4 modelViewMatrix;

uniform sampler2D t_aux;

varying vec3 cameraSpacePosition;
varying vec3 normal;

#pragma glslify: uvMap = require('./aux/uv.glsl')

void main() {
    float dist = acos(dot(normalize(hitPos), normalize(normal)));

    float range = step(dist, timer * PI) * step(timer * PI, dist + 0.5);

    vec2 uv = uvMap(normal);

    vec3 c_aux = texture2D(t_aux, uv).rgb;

    vec3 pos = normalize(cameraSpacePosition - modelViewMatrix[3].xyz);
    float cull = step(dot(pos, normalize(cameraSpacePosition)), 0.0);

    gl_FragColor = vec4(vec3(0, 0, c_aux.g), c_aux.g * range * cull);
}
