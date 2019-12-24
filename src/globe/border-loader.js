import { FileLoader, Vector2, Vector3 } from 'three'

export default async function (url) {
    const loader = new FileLoader();

    const file = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });

    // get data out of file
    const data = file.match(/path\ d="(.+)"/);
    if (data === null) {
        return null;
    }

    // get line strip entries
    const entries = data[1].match(/M(.+?)(?=M|$)/g);
    if (entries === null) {
        return null;
    }

    // get arrays of line strips
    const strips = [ ];
    entries.forEach(entry => {
        // extract 2D coordinates
        const coordinates = entry.match(/([\d.]+)\ ([\d.]+)/g);

        // get array of 3D points
        const strip = [ ];
        coordinates.forEach(coordinate => {
            // get 2D point
            const point = new Vector2(...coordinate.match(/([\d.]+)/g));

            const longitude = Math.PI - (point.x / 360 - 0.5) * Math.PI * 2 - (Math.PI / 2);
            const latitude = -(point.y / 180 - 0.5) * Math.PI;

            // const longitude = point.x;
            // const latitude = point.y;

            // map 2D point to 3D sphere position
            const position = new Vector3(
                Math.cos(latitude) * Math.cos(longitude),
                Math.sin(latitude),
                Math.cos(latitude) * Math.sin(longitude)
            );

            strip.push(position);
        });
        strips.push(strip);
    });
    return strips;
}
