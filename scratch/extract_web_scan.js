const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const filePath = 'TNG PRO C2P-Ver1.9-0328-2017.web';
const buffer = fs.readFileSync(filePath);
const outputDir = 'firmware_web_extracted';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Get filenames from table
const indexOffset = buffer.indexOf('index.htm');
let currentPos = indexOffset;
const filenames = [];

while (currentPos < buffer.length) {
    const filename = buffer.slice(currentPos, currentPos + 16).toString().replace(/\0/g, '');
    if (!filename || filename.length === 0 || !filename.includes('.')) break;
    filenames.push(filename);
    currentPos += 32;
}

console.log(`Found ${filenames.length} filenames.`);

// Find all GZIP headers
const headers = [];
for (let i = 2400; i < buffer.length - 1; i++) {
    if (buffer[i] === 0x1f && buffer[i+1] === 0x8b) {
        headers.push(i);
    }
}

console.log(`Found ${headers.length} GZIP headers.`);

// Map headers to filenames
for (let i = 0; i < Math.min(filenames.length, headers.length); i++) {
    const filename = filenames[i];
    const offset = headers[i];
    const nextOffset = (i < headers.length - 1) ? headers[i+1] : buffer.length;
    
    try {
        const cmd = `dd if="${filePath}" bs=1 skip=${offset} count=${nextOffset - offset} | gunzip > "${path.join(outputDir, filename)}" 2>/dev/null`;
        execSync(cmd);
        console.log(`Extracted ${filename} from offset ${offset}`);
    } catch (e) {
        if (fs.existsSync(path.join(outputDir, filename)) && fs.statSync(path.join(outputDir, filename)).size > 0) {
            console.log(`Extracted ${filename} (with warning)`);
        } else {
            console.log(`Failed ${filename}: ${e.message}`);
        }
    }
}
