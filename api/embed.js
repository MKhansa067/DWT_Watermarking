const { embedWatermark } = require('./wavelet_dwt');
const { Timer } = require('./utils');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const formidable = require('formidable');

    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ error: 'Failed to parse form data.' });
        }

        const coverFile = files.cover && files.cover[0];
        const watermarkFile = files.watermark && files.watermark[0];

        if (!coverFile || !watermarkFile) {
            return res.status(400).json({ error: 'Missing cover or watermark files.' });
        }

        const alpha = parseFloat(fields.alpha && fields.alpha[0]) || 0.4;
        const level = parseInt(fields.level && fields.level[0]) || 1;

        try {
            const coverBuffer = require('fs').readFileSync(coverFile.filepath);
            const watermarkBuffer = require('fs').readFileSync(watermarkFile.filepath);

            const timer = new Timer();
            timer.start();
            const { stegoBuffer, psnr } = await embedWatermark(coverBuffer, watermarkBuffer, alpha, level);
            timer.stop();

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment; filename="stego.png"',
                'PSNR': psnr.toString(),
                'X-Processing-Time': timer.elapsed.toFixed(3)
            });
            res.end(stegoBuffer);

        } catch (e) {
            console.error('Embedding error:', e);
            res.status(500).json({ error: 'Failed to embed watermark: ' + e.message });
        }
    });
};
