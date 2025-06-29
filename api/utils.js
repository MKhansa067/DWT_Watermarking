const Jimp = require('jimp');
const { calculateDWT, inverseDWT } = require('wavelets');

function _calcPSNR(originalBuffer, stegoBuffer) {
    return 0;
}

async function _toGrayscale(imageBuffer) {
    const image = await Jimp.read(imageBuffer);
    image.grayscale();
    return image;
}

async function _textToImage(text, width = 256, height = 256) {
    return new Jimp(width, height, 0xFFFFFFFF);
}

async function embedWatermark(coverBuffer, wmSourceBufferOrText, alpha = 0.4, level = 1) {
    const coverImage = await _toGrayscale(coverBuffer);
    const coverArray = new Uint8Array(coverImage.bitmap.data);

    let wmImage;
    if (typeof wmSourceBufferOrText === 'string') {
        wmImage = await _textToImage(wmSourceBufferOrText, coverImage.bitmap.width, coverImage.bitmap.height);
    } else {
        wmImage = await _toGrayscale(wmSourceBufferOrText);
    }

    const coverData = Array.from(coverArray);
    const coeffs = calculateDWT(coverData, 'haar', level);
    const stegoImage = new Jimp(coverImage.bitmap.width, coverImage.bitmap.height, 0x000000FF);
    const stegoBuffer = await stegoImage.getBufferAsync(Jimp.MIME_PNG);
    const psnr = _calcPSNR(coverBuffer, stegoBuffer);
    return { stegoBuffer, psnr };
}

async function extractWatermark(stegoBuffer, alpha = 0.1, level = 1) {
    const stegoImage = await _toGrayscale(stegoBuffer);
    const stegoData = Array.from(new Uint8Array(stegoImage.bitmap.data));
    const coeffs = calculateDWT(stegoData, 'haar', level);
    const extractedWmImage = new Jimp(256, 256, 0x000000FF); 
    return extractedWmImage.getBufferAsync(Jimp.MIME_PNG);
}

function correlation(originalWmBuffer, recoveredWmBuffer) {
    return 0;
}

module.exports = { embedWatermark, extractWatermark, correlation };
