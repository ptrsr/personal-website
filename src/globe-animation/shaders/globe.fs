precision highp float;

#define lightDir normalize(vec3(0.5, 0.5, 1))
#define pi 3.14159265359

uniform vec3 cameraPosition;
uniform float size;
uniform mat4 invViewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D dayTex;
uniform sampler2D nrmTex;
uniform sampler2D auxTex;

varying vec3 fragPos;

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist);
vec3 MapUV(vec3 normal, vec3 ray);

void main() {
    vec3 ray = normalize(cameraPosition - fragPos);

    vec2 test;
    if (Sphere(ray, cameraPosition, size, test)) {

        vec3 worldPos = (ray * test.x);
        vec3 normalDir = normalize(cameraPosition - worldPos);

        vec3 color = MapUV(normalDir, ray);

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

vec3 MapUV(vec3 normalDir, vec3 ray) {
    vec2 uv = vec2(
        0.5 + atan(normalDir.z, -normalDir.x) / (pi * 2.0),
        0.5 - asin(-normalDir.y) / pi
    );

    // texture mapping
    vec3 dayMap = texture2D(dayTex, uv).rgb;
    vec3 normalMap = texture2D(nrmTex, uv).rgb * 2.0 - 1.0;
    vec3 auxMap = texture2D(auxTex, uv).rgb;
    
    float lit = auxMap.r;
    float specular = auxMap.g;
    float cloud = auxMap.b;


    // for a stable light
    vec3 staticLightDir = (invViewMatrix * vec4(lightDir, 0)).rgb;

    // reflection of water
    vec3 reflectDir = reflect(-staticLightDir, normalDir);
    float reflectAmount = pow(max(dot(ray, reflectDir), 0.0), 6.0) * specular;

    dayMap += vec3(reflectAmount) / 1.5;

    // clouds
    dayMap = mix(dayMap, vec3(1), vec3(cloud));

    // normal mapping
    vec3 npole = (modelMatrix * vec4(0, 1, 0, 0)).xyz;
    vec3 tangent = -cross(normalDir, npole);
    vec3 biTangent = -cross(tangent, normalDir);
    mat3 tbn = mat3(tangent, biTangent, normalDir);

    vec3 normalMapDir = tbn * normalMap;

    // lighting of earth
    float shadow = max(0.0, dot(normalMapDir, staticLightDir));
    dayMap *= shadow;

    return dayMap;
}