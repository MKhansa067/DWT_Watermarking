const { extractWatermark } = require('./wavelet_dwt');

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

        const stegoFile = files.stego && files.stego[0];

        if (!stegoFile) {
            return res.status(400).json({ error: 'Missing stego image.' });
        }

        const alpha = parseFloat(fields.alpha && fields.alpha[0]) || 0.4;
        const level = parseInt(fields.level && fields.level[0]) || 1;

        try {
            const stegoBuffer = require('fs').readFileSync(stegoFile.filepath);
            const extractedWatermarkBuffer = await extractWatermark(stegoBuffer, alpha, level);

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment; filename="watermark.png"'
            });
            res.end(extractedWatermarkBuffer);

        } catch (e) {
            console.error('Extraction error:', e);
            res.status(500).json({ error: 'Failed to extract watermark: ' + e.message });
        }
    });
};
