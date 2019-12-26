#define PI 3.14159265359

vec2 uvMap(vec3 normalDir) {
    return vec2(
        atan(normalDir.x, normalDir.z) / (2.0 * PI) + 0.5,
        0.5 - asin(-normalDir.y) / PI
    );
}

#pragma glslify: export(uvMap)
