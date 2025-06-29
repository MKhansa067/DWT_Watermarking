const Jimp = require('jimp');

async function addSaltPepper(imageBuffer, amount = 0.005) {
    const image = await Jimp.read(imageBuffer);
    return image.getBufferAsync(Jimp.MIME_PNG);
}

async function medianFilter(imageBuffer, ksize = 3) {
    const image = await Jimp.read(imageBuffer);
    image.median(ksize);
    return image.getBufferAsync(Jimp.MIME_PNG);
}

class Timer {
    constructor() {
        this.t0 = 0;
        this.t1 = 0;
        this.elapsed = 0;
    }

    start() {
        this.t0 = process.hrtime.bigint();
    }

    stop() {
        this.t1 = process.hrtime.bigint();
        this.elapsed = Number(this.t1 - this.t0) / 1e9; // Convert nanoseconds to seconds
    }
}

module.exports = { addSaltPepper, medianFilter, Timer };
