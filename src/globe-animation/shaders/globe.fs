precision highp float;

#define LIGHT_DIR normalize(vec3(1, 0.3, 1))
#define PI 3.14159265359
#define MAX 10000


// scatter const
#define RATIO 0.98
#define RED_OUT 1.2


#define NUM_OUT_SCATTER 8.0
#define NUM_IN_SCATTER 15.0


uniform vec3 cameraPosition;
uniform float scale;
uniform mat4 invViewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D dayTex;
uniform sampler2D nrmTex;
uniform sampler2D auxTex;

varying vec3 fragPos;

vec2 Sphere(vec3 origin, vec3 ray, float radius);
vec3 MapUV(vec3 normal, vec3 ray, float light);
vec3 in_scatter( vec3 o, vec3 dir, vec2 e, vec3 l, float inner, float outer );

void main() {
    float inner = scale * RATIO;
    float outer = scale;

    vec3 ray = normalize(cameraPosition - fragPos);

    vec2 outerSphereHits = Sphere(cameraPosition, ray, outer);

    if (outerSphereHits.x > outerSphereHits.y) {
        gl_FragColor = vec4(0);
        return;
    }

    vec2 innerSphereHits = Sphere(cameraPosition, ray, inner);

    vec3 color = vec3(0);
    if (innerSphereHits.x < innerSphereHits.y) {
        vec3 worldPos = (ray * innerSphereHits.x);
        vec3 normalDir = normalize(cameraPosition - worldPos);
        color = MapUV(normalDir, ray, 1.0);
    }

    outerSphereHits.y = min(outerSphereHits.y, innerSphereHits.x);
    
    vec3 I = in_scatter( cameraPosition, ray, -outerSphereHits.yx, LIGHT_DIR, inner, outer);
    color += vec3(pow( I, vec3( 1.0 / 2.2 ) ));

    gl_FragColor = vec4(color, 1);
}

// ray intersects sphere
// e = -b +/- sqrt( b^2 - c )
vec2 Sphere(vec3 origin, vec3 ray, float radius) {
	float b = dot(origin, ray);
	float c = dot(origin, origin) - radius * radius;
	
	float d = b * b - c;
	if (d < 0.0) {
		return vec2(MAX, -MAX);
	}

	d = sqrt(d);
	return vec2(b-d, b+d);
}


vec3 MapUV(vec3 normalDir, vec3 ray, float light) {
    vec2 uv = vec2(
        0.5 + atan(normalDir.z, -normalDir.x) / (PI * 2.0),
        0.5 - asin(-normalDir.y) / PI
    );

    // texture mapping
    vec3 dayMap = texture2D(dayTex, uv).rgb;
    vec3 normalMap = texture2D(nrmTex, uv).rgb * 2.0 - 1.0;
    vec3 auxMap = texture2D(auxTex, uv).rgb;
    
    float lit = auxMap.r;
    float specular = auxMap.g;
    float cloud = auxMap.b;


    // for a stable light
    vec3 staticLightDir = (invViewMatrix * vec4(LIGHT_DIR, 0)).rgb;

    // reflection of water
    vec3 reflectDir = reflect(-LIGHT_DIR, normalDir);
    float reflectAmount = pow(max(dot(ray, reflectDir), 0.0), 6.0) * specular;

    dayMap += vec3(reflectAmount) / 2.0;

    // clouds
    dayMap = mix(dayMap, vec3(1), vec3(cloud));

    // normal mapPIng
    vec3 npole = (modelMatrix * vec4(0, 1, 0, 0)).xyz;
    vec3 tangent = -cross(normalDir, npole);
    vec3 biTangent = -cross(tangent, normalDir);
    mat3 tbn = mat3(tangent, biTangent, normalDir);

    vec3 normalMapDir = tbn * normalMap;

    // lighting of earth
    float shadow = max(0.01, dot(normalMapDir, LIGHT_DIR));
    dayMap *= shadow;

    dayMap += lit * pow((1.0 - shadow), 4.0);

    return dayMap;
}



// // math const
// const float MAX = 10000.0;



// Mie
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8PI * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
float phase_mie( float g, float c, float cc ) {
	float gg = g * g;
	
	float a = ( 1.0 - gg ) * ( 1.0 + cc );

	float b = 1.0 + gg - 2.0 * g * c;
	b *= sqrt( b );
	b *= 2.0 + gg;	
	
	return ( 3.0 / 8.0 / PI ) * a / b;
}

// Rayleigh
// g : 0
// F = 3/16PI * ( 1 + c^2 )
float phase_ray( float cc ) {
	return ( 3.0 / 16.0 / PI ) * ( 1.0 + cc );
}



float density( vec3 p, float ph, float d ) {
	return exp( -max( length( p ) - d, 0.0 ) / ph );
}

float optic( vec3 p, vec3 q, float ph, float d ) {
	vec3 s = ( q - p ) / NUM_OUT_SCATTER;
	vec3 v = p + s * 0.5;
	
	float sum = 0.0;
	for ( float i = 0.0; i < NUM_OUT_SCATTER; i++ ) {
		sum += density( v, ph, d );
		v += s;
	}
	sum *= length( s );
	
	return sum;
}


vec3 in_scatter( vec3 o, vec3 dir, vec2 e, vec3 l, float inner, float outer ) {
	const float ph_ray = 0.005;
    const float ph_mie = 0.0001;
    
    const vec3 k_ray = vec3( 3.8, 13.5, 33.1 );
    const vec3 k_mie = vec3( 21.0 );
    const float k_mie_ex = 0.0;
    
	vec3 sum_ray = vec3( 0.0 );
    vec3 sum_mie = vec3( 0.0 );
    
    float n_ray0 = 0.0;
    float n_mie0 = 0.0;
    
	float len = ( e.y - e.x ) / float( NUM_IN_SCATTER );
    vec3 s = dir * len;
	vec3 v = o + dir * ( e.x + len * 0.5 );
    
    for ( float i = 0.0; i < NUM_IN_SCATTER; i++ ) {   
		float d_ray = density( v, ph_ray, inner ) * len;
        float d_mie = density( v, ph_mie, inner ) * len;
        
        n_ray0 += d_ray;
        n_mie0 += d_mie;
        

        vec2 f = Sphere( v, l, outer * RED_OUT );
		vec3 u = v + l * f.y;
        
        float n_ray1 = optic( v, u, ph_ray, inner );
        float n_mie1 = optic( v, u, ph_mie, inner );
		
        vec3 att = exp( - ( n_ray0 + n_ray1 ) * k_ray - ( n_mie0 + n_mie1 ) * k_mie * k_mie_ex );
        
		sum_ray += d_ray * att;
        sum_mie += d_mie * att;

        v += s; // HACK
	}
	
	float c  = dot( dir, -l );
	float cc = c * c;
    vec3 scatter =
        sum_ray * k_ray * phase_ray( cc ) +
     	sum_mie * k_mie * phase_mie( -0.78, c, cc );
    
	
	return 3.0 * scatter;
}
