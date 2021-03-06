import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader, Vector3, Group, PlaneGeometry } from "three";
import { RepeatWrapping, Line } from "three";

import SVGLoader from '../aux/svg-loader.js'

import sphereVertShader from './shaders/sphere.vs'
import globeFragShader from './shaders/globe.fs'

import mapVertShader from './shaders/map.vs'
import mapFragShader from './shaders/map.fs'


export default class Globe extends Mesh {
    constructor(settings) {
        const geometry = new PlaneGeometry(2, 2);

        const loader = new TextureLoader();
        const t_day = loader.load('public/earth/earth-day.jpg');
        const t_aux = loader.load('public/earth/earth-aux.jpg');
        
        t_day.wrapS = RepeatWrapping;
        t_aux.wrapS = RepeatWrapping;

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: {
                sunLightDir: { value: new Vector3() },
                invViewMatrix: { value: new Matrix4() },
                scale: { value: settings.scale },
                
                a_color: { value: settings.atmosphere.color },
                a_brightness: { value: settings.atmosphere.brightness },
                a_reflection: { value: settings.atmosphere.reflection },
                a_ray: { value: settings.atmosphere.ray },
                a_mie: { value: settings.atmosphere.mie },
                a_spread: { value: settings.atmosphere.spread },
                a_thick: { value: settings.atmosphere.thick },
                a_test: { value: settings.atmosphere.test },


                t_day: { type: 't', value: t_day },
                t_aux: { type: 't', value: t_aux },

            },
            vertexShader: sphereVertShader,
            fragmentShader: globeFragShader,
            transparent: true
        });

        // mesh constructor
        super(geometry, material);
        
        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    setSunDir = (dir) => {
        this.material.uniforms.sunLightDir.value = dir;
    }

    loadBorders = (svgUrl) => {
        // onLoad will be called once the data has been parsed from the svgUrl
        const onLoad = function(data) {
            const borders = new Group();

            // width and height of SVG
            const width = data.xml.width.animVal.value;
            const height = data.xml.height.animVal.value;
    
            const material = new RawShaderMaterial({
                vertexShader: mapVertShader,
                fragmentShader: mapFragShader
            });
    
            // for each country
            for (let i = 0; i < data.paths.length; i++) {
                const countryPath = data.paths[i];
                const spherePoints = [];
    
                // for each border
                for (let j = 0; j < countryPath.subPaths.length; j++) {
                    const border = countryPath.subPaths[j];
                    const points = border.getPoints();
    
                    // for each 2D point
                    for (let k = 0; k < points.length; k++) {
                        const point = points[k];
    
                        // TODO: fix the scaling due to SVG cutting off top and bottom
                        const scale = 1.02;
                        const longitude = Math.PI - (point.x / width - 0.5) * Math.PI * 2 - (Math.PI / 2);
                        const latitude = -(point.y / height - 0.5) * Math.PI * 0.962 - 0.055;
    
                        // map 2D point to 3D sphere
                        spherePoints.push(
                            Math.cos(latitude) * Math.cos(longitude) / scale,
                            Math.sin(latitude) / scale,
                            Math.cos(latitude) * Math.sin(longitude) / scale
                        );
                    }
                }
    
                const geometry = new BufferGeometry().addAttribute('position', new Float32BufferAttribute(spherePoints, 3));
                const mesh = new Line(geometry, material);
                mesh.frustumCulled = false;
                borders.add(mesh);
            }
            this.add(borders);
        };

        // load SVG
        new SVGLoader().load(
            svgUrl, 
            onLoad.bind(this),
            function(xhr) {console.log("loading...")},
            function(error) {console.error(error)}
        );
    }
}
