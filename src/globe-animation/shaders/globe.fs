precision highp float;

#define light -normalize(vec3(1))
#define pi 3.14159265359

uniform vec3 cameraPosition;
uniform float size;
uniform mat4 modelMatrix;

uniform sampler2D dayMap1;
uniform sampler2D dayMap2;

varying vec3 worldPos;

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist);
vec3 MapUV(vec3 normal);

void main() {
    vec3 ray = normalize(cameraPosition - worldPos);

    vec2 test;
    if (Sphere(ray, cameraPosition, size, test)) {

        vec3 iPos = (ray * test.x);
        vec3 iNormal = normalize(cameraPosition - iPos);

        vec3 color = MapUV(iNormal);

        float lit = max(0.0, dot(iNormal, light));


        gl_FragColor = vec4(color, 1);

        return;
    }

    gl_FragColor = vec4(ray, 1);
}

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist) {
    dist = vec2(0, 0);
    vec2 t;
    vec3 L = -pos;

    float a = dot(ray, ray);
    float b = 2.0 * dot(ray, L);
    float c = dot(L, L) - pow(radius, 2.0);

    float discr = b * b - 4.0 * a * c;

    if (discr < 0.0) {
        return false;
    } else if (discr == 0.0)
    {
        t.x = (-0.5 * b) / a;
        t.y = t.x;
    } else {
        float q = b > 0.0 ?
            -0.5 * (b + sqrt(discr)) :
        -0.5 * (b - sqrt(discr));

        t = vec2(q / a, c / q);
    }

    if (t.x > t.y) {
        t = t.yx;
    }
    dist = t;
    return true;
}

vec3 MapUV(vec3 normal) {
    vec2 uv = vec2(
        0.5 + atan(normal.z, normal.y) / (pi * 2.0),
        0.5 - asin(normal.x) / pi
    );

    // divide world uv for 2 textures
    vec4 fUV = vec4(
        vec2(uv.x * 2.0, uv.y),
        vec2((uv.x - 0.5) * 2.0, uv.y)
    );

    // texture mapping
    vec4 map = uv.x > 0.5 ?
      texture2D(dayMap1, fUV.xy) :
      texture2D(dayMap2, fUV.zw);

    // lighting of earth
    //float lit = max(0.0, dot(normal, light));

    return map.xyz;
}