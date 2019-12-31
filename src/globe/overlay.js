import { Group, Mesh, BufferGeometry, BufferAttribute, RawShaderMaterial, Sphere, Raycaster, Vector2, Vector3, FileLoader, LineSegments, LineBasicMaterial } from 'three'
import IcoGen from '../aux/ico-gen.js'

import mapVertShader from './shaders/map.vs'
import icoFragShader from './shaders/ico.fs'
import bordersFragShader from './shaders/borders.fs'

function bordersFromSVG(svg) {
    // get data out of file
    const data = svg.match(/path\ d="(.+)"/);
    if (data === null) {
        return null;
    }
    // get line strip entries
    const entries = data[1].match(/M(.+?)(?=M|$)/g);
    if (entries === null) {
        return null;
    }
    // get arrays of line strips
    const borders = [ ];
    entries.forEach(entry => {
        // extract 2D coordinates
        const coordinates = entry.match(/([\d.]+)\ ([\d.]+)/g);
        // get array of 3D points
        const line = [ ];

        coordinates.forEach(coordinate => {
            // 2D border position
            const border = new Vector2(...coordinate.match(/([\d.]+)/g));

            // UV map
            // TODO: scale 360 and 180 with width and height of SVG
            const longitude = Math.PI - (border.x / 360 - 0.5) * Math.PI * 2 - (Math.PI / 2);
            const latitude = -(border.y / 180 - 0.5) * Math.PI;

            // map 2D point to 3D sphere vertex
            const vertex = new Vector3(
                Math.cos(latitude) * Math.cos(longitude),
                Math.sin(latitude),
                Math.cos(latitude) * Math.sin(longitude)
            );
            line.push(vertex);
        });
        borders.push(line);
    });
    return borders;
}

export default class Digital extends Group {
    constructor(order = 4, duration = 2, t_aux) {
        super();

        const url = '/public/map.svg';
        const loader = new FileLoader();

        // load file
        const svg = new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });

        // load resources and add them
        (async () => {
            const objects = await Promise.all([
                this.createBorders(svg),
                this.createIcosphere(order, t_aux)
            ]);
            const [ borders, ico ] = objects;

            this.add(...objects);
            this.borders = borders;
            this.ico = ico;
        })();

        this.duration = duration;
        this.timer = 0;
    }

    digitalize = (state, delta) => {
        this.timer += delta;
        
        // stop the animation
        if (this.timer > this.duration) {
            this.timer = 0;

            this.ico.material.uniforms.timer.value = 0;
            this.borders.material.uniforms.timer.value = 1;

            return false;
        }
        // animation timing
        const animationState = this.timer / this.duration;
        this.ico.material.uniforms.timer.value = animationState;
        this.borders.material.uniforms.timer.value = animationState;
    }

    onClickDown = (state, event) => {
        // get click position
        let clickPos;
        if (event.type === "mousedown") {
            clickPos = new Vector2(event.clientX, event.clientY);
        } else if (event.type === "touchstart") {
            clickPos = new Vector2(event.touches[0].clientX, event.touches[0].clientY);
        }
        // scroll support
        const canvasRect = event.target.getBoundingClientRect();
        clickPos.x -= canvasRect.left;
        clickPos.y -= canvasRect.top;
        clickPos.multiplyScalar(window.devicePixelRatio)
        
        // NDC viewport
        clickPos.x =  (clickPos.x / state.canvas.width) * 2 - 1;
        clickPos.y = -(clickPos.y / state.canvas.height) * 2 + 1;
        
        // raycasting from active camera
        const caster = new Raycaster();
        caster.setFromCamera(clickPos, state.objects.camera);
        
        // define sphere to hit test
        const globe = state.objects.globe;
        const sphere = new Sphere(globe.position, globe.material.uniforms.scale.value);

        // set hit pos in overlay
        const hit = new Vector3();
        caster.ray.intersectSphere(sphere, hit);
        this.ico.material.uniforms.hitPos.value = hit;
        this.borders.material.uniforms.hitPos.value = hit;

        // play animation
        state.updateables.digitalize = this.digitalize;
    }

    createIcosphere = (order, t_aux) => {
        // generate icosphere
        const ico = IcoGen(order, false);
                
        // custom material
        const material = new RawShaderMaterial({
            // shader programs
            vertexShader: mapVertShader,
            fragmentShader: icoFragShader,
            
            uniforms: {
                // primitives
                hitPos: { value: new Vector3() },
                timer: { value: 0 },

                // texture
                t_aux: { type: 't', value: t_aux },
            },
            // options
            wireframe: true,
            transparent: true
        });

        // create icosphere geometry
        const geometry = new BufferGeometry();
        geometry.addAttribute('position', new BufferAttribute(ico.vertices, 3, false));
        geometry.setIndex(new BufferAttribute(ico.triangles, 1, false));
        // geometry.addAttribute('test', new BufferAttribute(ico.test, 1, false));

        return new Mesh(geometry, material);
    }

    createBorders = async (svg) => {
        svg = await svg;

        const geometry = new BufferGeometry();
        { // load border data from SVG
            const borderData = bordersFromSVG(svg);

            // order of vertices
            const indices = [ ];
            // border line made out of multiple vertices
            let borderAmount = 0;
            // for each strip
            for (let j = 0; j < borderData.length; j++) {
                // for each vertex
                for (let i = 0; i < borderData[j].length - 1; i++) {
                    /* 
                        GL_LINES are going to be used to make invisible jumps.
                        Example:
                        .  = vertex
                        -  = line
                        0-4 = indices

                        .-.-. .-.
                        0 1 2 3 4

                        the above can be defined by the sequence: 0 1 1 2 3 4
                        where every two indices are a line.
                    */
                    indices.push(i + borderAmount, i + borderAmount + 1);
                }
                // create one long line with jumps
                borderAmount += borderData[j].length;
            }
            // buffer for GPU
            let vertices = new Float32Array(borderAmount * 3);

            // upload 
            let k = 0;
            for (let j = 0; j < borderData.length; j++) {
                for (let i = 0; i < borderData[j].length; i++) {
                    const vertice = borderData[j][i];
                    vertices[k * 3]     = vertice.x;
                    vertices[k * 3 + 1] = vertice.y;
                    vertices[k * 3 + 2] = vertice.z;
                    k++;
                }
            }
            // set geometry data
            geometry.addAttribute('position', vertices, 3);
            geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1, false));
        }

        // custom material
        const material = new RawShaderMaterial({
            // shader programs
            vertexShader: mapVertShader,
            fragmentShader: bordersFragShader,
            
            uniforms: {
                // primitives
                hitPos: { value: new Vector3() },
                timer: { value: 0 },
            },
            // options
            transparent: true
        });

        
        return new LineSegments(geometry, material);
    }
}
