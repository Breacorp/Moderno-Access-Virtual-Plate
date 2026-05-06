const fs = require('fs');
const zlib = require('zlib');

const buffer = fs.readFileSync('TNG PRO C2P-Ver2.09.00-0328-2017_code.bin');
// Find the GZIP header 1F 8B 08
const offset = buffer.indexOf(Buffer.from([0x1f, 0x8b, 0x08]));

if (offset !== -1) {
    console.log(`Found GZIP header at offset ${offset}`);
    const gzipped = buffer.slice(offset);
    try {
        const unzipped = zlib.gunzipSync(gzipped);
        fs.writeFileSync('scratch/code_unzipped.bin', unzipped);
        console.log(`Unzipped successfully! Size: ${unzipped.length} bytes`);
    } catch (e) {
        console.error('Failed to unzip:', e);
    }
} else {
    console.log('No GZIP header found.');
}
