const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const filePath = 'TNG PRO C2P-Ver1.9-0328-2017.web';
const buffer = fs.readFileSync(filePath);
const outputDir = 'firmware_web_extracted';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const indexOffset = buffer.indexOf('index.htm');
let currentPos = indexOffset;
const files = [];

while (currentPos < buffer.length) {
    const filename = buffer.slice(currentPos, currentPos + 16).toString().replace(/\0/g, '');
    if (!filename || filename.length === 0 || !filename.includes('.')) break;

    const size = buffer.readUInt32LE(currentPos + 16);
    const offset = buffer.readUInt32LE(currentPos + 20);
    
    files.push({ filename, size, offset });
    currentPos += 32;
}

const dataStart = 2462;

files.forEach(file => {
    try {
        const absoluteOffset = dataStart + file.offset;
        const cmd = `dd if="${filePath}" bs=1 skip=${absoluteOffset} | gunzip > "${path.join(outputDir, file.filename)}" 2>/dev/null`;
        execSync(cmd);
        console.log(`Extracted ${file.filename}`);
    } catch (e) {
        // gunzip often returns exit code 2 because of trailing garbage, so we ignore it if the file was created
        if (fs.existsSync(path.join(outputDir, file.filename)) && fs.statSync(path.join(outputDir, file.filename)).size > 0) {
            console.log(`Extracted ${file.filename} (with trailing garbage warning)`);
        } else {
            console.log(`Failed to extract ${file.filename}: ${e.message}`);
        }
    }
});
