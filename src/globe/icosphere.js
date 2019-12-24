import { Group, Mesh, BufferGeometry, BufferAttribute, RawShaderMaterial, Sphere, Raycaster, Vector2, Vector3, Float32BufferAttribute, LineSegments, LineBasicMaterial } from 'three'
import IcoGen from '../aux/ico-gen.js'

import vert from './shaders/ico.vs'
import frag from './shaders/ico.fs'
import bordersFragShader from './shaders/borders.fs'

import loadBoarders from './border-loader.js'

export default class Icosphere extends Mesh {
    constructor(order = 4, duration = 2, t_aux) {
        const ico = IcoGen(order, false);
        const geometry = new BufferGeometry();

        geometry.addAttribute('position', new BufferAttribute(ico.vertices, 3, false));
        geometry.addAttribute('test', new BufferAttribute(ico.test, 1, false));
        
        
        geometry.setIndex(new BufferAttribute(ico.triangles, 1, false));


        const material = new RawShaderMaterial({
            uniforms: {
                order: { value: order },
                hitPos: { value: new Vector3() },
                timer: { value: 0 },

                t_aux: { type: 't', value: t_aux },
            },

            vertexShader: vert,
            fragmentShader: frag,
            wireframe: true,
            transparent: true
        });

        super(geometry, material);

        this.duration = duration;
        this.timer = 0;
    }

    update = (state, delta) => {

        this.timer += delta;
        
        if (this.timer > this.duration) {
            this.timer = 0;
            this.material.uniforms.timer.value = 0;
            return false;
        }

        this.material.uniforms.timer.value = this.timer / this.duration;
    }

    onClickDown = (state, event) => {
        let clickPos;
        if (event.type === "mousedown") {
            clickPos = new Vector2(event.clientX, event.clientY);
        } else if (event.type === "touchstart") {
            clickPos = new Vector2(event.touches[0].clientX, event.touches[0].clientY);
        }

        const rect = event.target.getBoundingClientRect();
        clickPos.x -= rect.left;
        clickPos.y -= rect.top;

        clickPos.multiplyScalar(window.devicePixelRatio)
        
        clickPos.x =  (clickPos.x / state.canvas.width) * 2 - 1;
        clickPos.y = -(clickPos.y / state.canvas.height) * 2 + 1;
        
        const caster = new Raycaster();
        caster.setFromCamera(clickPos, state.objects.camera);
        
        const globe = state.objects.globe;
        const sphere = new Sphere(globe.position, globe.material.uniforms.scale.value);

        const hit = new Vector3();
        caster.ray.intersectSphere(sphere, hit);
        this.material.uniforms.hitPos.value = hit;

        state.updateables.ico = this.update;
    }

    createBorders = async (svgUrl, scene) => {
        const borderData = await loadBoarders(svgUrl);
        const borderGroup = new Group();

        const material = new LineBasicMaterial({
            color: 0x0000ff
         });


        const indices = [ ];
        let total = 0;

        // for each continent
        for (let j = 0; j < borderData.length; j++) {
            // for each piece of line
            for (let i = 0; i < borderData[j].length - 1; i++) {
                indices.push(i + total, i + total + 1);
            }
            total += borderData[j].length;
        }

        let vertices = new Float32Array(total * 3);

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
        const geometry = new BufferGeometry();

        geometry.addAttribute('position', vertices, 3);
        geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1, false));

        const line = new LineSegments(geometry, material);
        scene.add(line);


        // borderData.forEach(border => {
        //     border.forEach(vertice => {
        //         vertices.push
        //         vertices.push(vertice.x, vertice.y, vertice.z);
        //     });
        // });

        // let buffer = [ ];
        // vertices.forEach(vertice => {
        //     buffer.push(vertice.x, vertice.y, vertice.z);
        // });
        // const test = new BufferAttribute(new Float32Array(buffer), 3);
        // console.log(test)


        // console.log(borderData)
        // console.log(indices)

        // borderData.forEach(border => {
        //     const geometry = new Geometry();
        //     geometry.vertices.push(...border);
        //     scene.add(new Line(geometry, material));
        // });


    //     // onLoad will be called once the data has been parsed from the svgUrl
    //     const onLoad = function(data) {
    //         console.log(data)
    //         const borders = new Group();

    //         // width and height of SVG
    //         const width = data.xml.width.animVal.value;
    //         const height = data.xml.height.animVal.value;
    
    //         const material = new RawShaderMaterial({
    //             vertexShader: vert,
    //             fragmentShader: bordersFragShader
    //         });
    
    //         // for each country
    //         for (let i = 0; i < data.paths.length; i++) {
    //             const countryPath = data.paths[i];
    //             const spherePoints = [];
    
    //             // for each border
    //             for (let j = 0; j < countryPath.subPaths.length; j++) {
    //                 const border = countryPath.subPaths[j];
    //                 const points = border.getPoints();
    
    //                 // for each 2D point
    //                 for (let k = 0; k < points.length; k++) {
    //                     const point = points[k];
    
    //                     // TODO: fix the scaling due to SVG cutting off top and bottom
    //                     const longitude = Math.PI - (point.x / width - 0.5) * Math.PI * 2 - (Math.PI / 2);
    //                     const latitude = -(point.y / height - 0.5) * Math.PI;
    
    //                     // map 2D point to 3D sphere
    //                     spherePoints.push(
    //                         Math.cos(latitude) * Math.cos(longitude),
    //                         Math.sin(latitude),
    //                         Math.cos(latitude) * Math.sin(longitude)
    //                     );
    //                 }
    //             }
    //             const geometry = new BufferGeometry().addAttribute('position', new Float32BufferAttribute(spherePoints, 3));
    //             const mesh = new Line(geometry, material);
    //             mesh.frustumCulled = false;
    //             borders.add(mesh);
    //         }
    //         this.add(borders);
    //     };

    //     // load SVG
    //     new SVGLoader().load(
    //         svgUrl,
    //         onLoad.bind(this),
    //         function(xhr) {console.log("loading...")},
    //         function(error) {console.error(error)}
    //     );
    // }
    }
}
