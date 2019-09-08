precision highp float;

#define light -normalize(vec3(1))

uniform vec3 cameraPosition;
varying vec3 worldPos;
uniform float size;

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist);

void main() {
    vec3 ray = normalize(worldPos - cameraPosition);

    vec2 test;
    if (Sphere(ray, cameraPosition, size, test)) {

        vec3 iPos = (ray * test.x);
        vec3 iNormal = normalize(iPos - cameraPosition);

        float lit = max(0.0, dot(iNormal, light));


        gl_FragColor = vec4(vec3(lit), 1);

        return;
    }

    gl_FragColor = vec4(ray, 1);
    

}

bool Sphere(vec3 ray, vec3 pos, float radius, out vec2 dist)
{
    dist = vec2(0, 0);
    vec2 t;
    vec3 L = -pos;

    float a = dot(ray, ray);
    float b = 2.0 * dot(ray, L);
    float c = dot(L, L) - pow(radius, 2.0);

    float discr = b * b - 4.0 * a * c;

    if (discr < 0.0)
    return false;
  else if (discr == 0.0)
    {
        t.x = (-0.5 * b) / a;
        t.y = t.x;
    }
  else
    {
        float q = b > 0.0 ?
            -0.5 * (b + sqrt(discr)) :
        -0.5 * (b - sqrt(discr));

        t = vec2(q / a, c / q);
    }

    if (t.x > t.y)
        t = t.yx;

    dist = t;
    return true;
}
