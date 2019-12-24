precision highp float;

varying float fCol;
varying vec3 normal;

uniform float order;
uniform float timer;

uniform vec3 hitPos;

uniform sampler2D t_aux;

#define PI 3.14159265359

vec2 uvMap(vec3 normalDir);

void main() {
    float dist = acos(dot(normalize(hitPos), normalize(normal)));

    float range = step(dist, timer * PI) * step(timer * PI, dist + 0.2);

    vec2 uv = uvMap(normal);

    vec3 c_aux = texture2D(t_aux, uv).rgb;
    float specular = 1.0 - c_aux.g;

    gl_FragColor = vec4(vec3(1), range * specular);
}

vec2 uvMap(vec3 normalDir) {
    return vec2(
        atan(normalDir.x, normalDir.z) / (2.0 * PI) + 0.5,
        0.5 - asin(-normalDir.y) / PI
    );
}