precision highp float;

#define light normalize(vec3(0.5, 0.5, 1))
#define pi 3.14159265359

uniform vec3 cameraPosition;
uniform float size;
uniform mat4 invViewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D dayMap1;
uniform sampler2D dayMap2;

uniform sampler2D normalMap1;
uniform sampler2D normalMap2;

uniform sampler2D combinedMap1;
uniform sampler2D combinedMap2;

varying vec3 worldPos;

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist);
vec3 MapUV(vec3 normal, vec3 ray);

void main() {
    vec3 ray = normalize(cameraPosition - worldPos);

    vec2 test;
    if (Sphere(ray, cameraPosition, size, test)) {

        vec3 iPos = (ray * test.x);
        vec3 iNormal = normalize(cameraPosition - iPos);

        vec3 color = MapUV(iNormal, ray);

        float lit = max(0.0, dot(iNormal, light));


        gl_FragColor = vec4(color, 1);

        return;
    }

    gl_FragColor = vec4(vec3(0), 1);
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

vec3 MapUV(vec3 normal, vec3 ray) {
    vec2 uv = vec2(
        0.5 + atan(normal.z, -normal.x) / (pi * 2.0),
        0.5 - asin(-normal.y) / pi
    );

    // divide world uv for 2 textures
    vec4 fUV = vec4(
        vec2(uv.x * 2.0 - 1.0, uv.y),
        vec2((uv.x * 2.0), uv.y)
    );

    // texture mapping
    vec3 map;
    vec3 nmap;

    float specular = 0.0;
    float cloud = 0.0;
    float lit = 0.0;

    if (uv.x > 0.5) {
        map = texture2D(dayMap1, fUV.xy).rgb;
        nmap = texture2D(normalMap1, fUV.xy).rgb;

        vec3 combined = texture2D(combinedMap1, fUV.xy).rgb;
        specular = combined.r;
        cloud = combined.g;
        lit = combined.b;
    } else {
        map = texture2D(dayMap2, fUV.zw).rgb;
        nmap = texture2D(normalMap2, fUV.zw).rgb;

        vec3 combined = texture2D(combinedMap2, fUV.zw).rgb;
        specular = combined.r;
        cloud = combined.g;
        lit = combined.b;
    }

    nmap = nmap * 2.0 - 1.0;

    vec3 color = map.xyz;

    // for a stable light
    vec3 lightTest = (invViewMatrix * vec4(light, 0)).rgb;

    // reflection of water
    vec3 reflectDir = reflect(-lightTest, normal);
    float r = pow(max(dot(ray, reflectDir), 0.0), 6.0) * specular;

    color += vec3(r) / 1.5;

    // clouds
    color = mix(color, vec3(1), vec3(cloud));

    // normal mapping
    mat4 modelCopy = modelMatrix;
    modelCopy[3][3] = 0.0;

    vec3 npole = (modelCopy * vec4(0, 1, 0, 0)).xyz;
    vec3 tangent = cross(normal, npole);
    vec3 biTangent = -cross(tangent, normal);

    mat3 tbn;
    tbn[0] = tangent;
    tbn[1] = biTangent;
    tbn[2] = normal;

    nmap.xy *= 2.0;
    nmap = normalize(nmap);

    vec3 test = tbn * nmap;

    // lighting of earth
    float shadow = max(0.0, dot(test, lightTest));
    color *= shadow;



    return color;
}