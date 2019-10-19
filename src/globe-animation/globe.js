import { Matrix4, BufferGeometry, Float32BufferAttribute, RawShaderMaterial, Mesh, TextureLoader, Vector3, Quaternion, Euler, Group, MeshBasicMaterial, Color, DoubleSide, ShapeBufferGeometry, LineBasicMaterial } from "three";
import { RepeatWrapping, Line } from "three";
import SunCalc from 'suncalc';

import globeVertShader from './shaders/globe.vs'
import globeFragShader from './shaders/globe.fs'

import mapVertShader from './shaders/map.vs'
import mapFragShader from './shaders/map.fs'


export default class Globe extends Mesh {
    constructor(scale = 1) {
        // simple plane geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute("vertexPos", new Float32BufferAttribute([
             1,  1, 0,  // TR
            -1,  1, 0,  // TL
             1, -1, 0,  // BR
            -1, -1, 0], // BL
            3)
        );
        geometry.setIndex([ 0, 1, 2, 1, 3, 2 ]);

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
            fragmentShader: globeFragShader
        });

        // mesh constructor
        super(geometry, material);
        
        this.onBeforeRender = (renderer, scene, camera, geometry, material) => {
            material.uniforms.invViewMatrix.value = camera.matrixWorld;
        }
    }

    setSunPos = (date) => {
        const test = SunCalc.getPosition(date, 90, 0);

        const q = new Quaternion().setFromEuler(new Euler(-test.altitude, -test.azimuth, 0));
        const dir = new Vector3(0,0,1).applyQuaternion(q);

        this.material.uniforms.lDir.value = dir;
    }

    loadBorders = (scene, data) => {
        const scale = 2.005;
        const width = data.xml.width.animVal.value;
        const height = data.xml.height.animVal.value;

        const borders = new Group();

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

                    const longitude = Math.PI - (point.x / width - 0.5) * Math.PI * 2 - (Math.PI / 2);
                    const latitude = -(point.y / height - 0.5) * Math.PI * 0.962 - 0.055;

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
        scene.add(borders);
    }
}
