precision highp float;

uniform float timer;
uniform vec3 hitPos;

uniform sampler2D t_aux;

varying vec3 normal;

#pragma glslify: uvMap = require('./aux/uv.glsl')

void main() {
    float dist = acos(dot(normalize(hitPos), normalize(normal)));

    float range = step(dist, timer * PI) * step(timer * PI, dist + 0.2);

    vec2 uv = uvMap(normal);

    vec3 c_aux = texture2D(t_aux, uv).rgb;
    // float specular = 1.0 - c_aux.g;

    gl_FragColor = vec4(vec3(0, 0, c_aux.g), c_aux.g * range);
}
