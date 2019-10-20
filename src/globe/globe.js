import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader, Vector3, Quaternion, Euler, Group, PlaneGeometry } from "three";
import { RepeatWrapping, Line } from "three";

import SunCalc from 'suncalc';
import SVGLoader from '../aux/svg-loader.js'

import globeVertShader from './shaders/globe.vs'
import globeFragShader from './shaders/globe.fs'

import mapVertShader from './shaders/map.vs'
import mapFragShader from './shaders/map.fs'


export default class Globe extends Mesh {
    constructor(scale = 1) {
        const geometry = new PlaneGeometry(2, 2);

        const loader = new TextureLoader();
        const dayTex = loader.load('assets/earth/earth-day.jpg');
        const auxTex = loader.load('assets/earth/earth-aux.jpg');
        const nrmTex = loader.load('assets/earth/earth-nrm.jpg');
        
        dayTex.wrapS = RepeatWrapping;
        auxTex.wrapS = RepeatWrapping;
        nrmTex.wrapS = RepeatWrapping;

        // globe shader
        const material = new RawShaderMaterial({
            uniforms: {
                lDir: { value: new Vector3() },
                invViewMatrix: { value: new Matrix4() },
                scale: { value: scale },
                dayTex: { type: 't', value: dayTex },
                auxTex: { type: 't', value: auxTex },
                nrmTex: { type: 't', value: nrmTex },

            },
            vertexShader: globeVertShader,
            fragmentShader: globeFragShader,
            transparent: true
        });

        // mesh constructor
        super(geometry, material);
        
        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    setSunPos = (date) => {
        const sunPos = SunCalc.getPosition(date, 90, 0);

        const q = new Quaternion().setFromEuler(new Euler(-sunPos.altitude, -sunPos.azimuth, 0));
        const dir = new Vector3(0,0,1).applyQuaternion(q);

        this.material.uniforms.lDir.value = dir;
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
                        const scale = 2.005;
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
