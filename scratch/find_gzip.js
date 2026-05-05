const fs = require('fs');
const buffer = fs.readFileSync('TNG PRO C2P-Ver1.9-0328-2017.web');

let count = 0;
for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === 0x1f && buffer[i+1] === 0x8b) {
        console.log(`GZIP header found at offset: ${i}`);
        count++;
        if (count > 10) break;
    }
}
console.log(`Total headers found (first 11): ${count}`);
