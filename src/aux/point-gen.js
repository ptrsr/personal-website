


export default class PointGen {
    constructor(t_aux) {
        this.test(t_aux);
    }

    async test(t_aux) {
        const image = (await t_aux).image;

        const canvas = document.createElement('canvas');
        canvas.with = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const imagedata = context.getImageData(0, 0, image.width, image.height);

        console.log(this.getPixel(imagedata, 100, 100))
    }
    getPixel(imagedata, x, y) {
        const position = (x + imagedata.width * y) * 4;
        const data = imagedata.data;
        
        return { 
            r: data[position], 
            g: data[position + 1], 
            b: data[position + 2], 
            a: data[position + 3] 
        };
    
    }
    
}
