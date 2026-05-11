const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SERIAL_NUMBER = process.env.SERIAL_NUMBER || '084764(112334)';
const MODERNO_API_URL = process.env.MODERNO_API_URL || 'https://access.moderno.com.ar';
const SYNC_URL = `${MODERNO_API_URL}/api/public/devices/${SERIAL_NUMBER}/sync`;
const WEBHOOK_URL = `${MODERNO_API_URL}/api/webhooks/hardware-event`; // Ignore local .env for this test

console.log(`[Test] Serial Number: ${SERIAL_NUMBER}`);

async function testSync() {
    console.log(`\n[Test 1] Attempting to sync with: ${SYNC_URL}`);
    try {
        const response = await axios.get(SYNC_URL, { timeout: 5000 });
        console.log('[Test 1] Connection SUCCESS!');
        console.log('[Test 1] Board Name:', response.data.board.name);
    } catch (err) {
        console.error('[Test 1] Connection FAILED!', err.message);
    }
}

async function testWebhook() {
    console.log(`\n[Test 2] Attempting to send webhook to: ${WEBHOOK_URL}`);
    try {
        const payload = {
            serial: SERIAL_NUMBER,
            timestamp: new Date().toISOString(),
            user: "Audit Tool",
            action: "System Audit Verified",
            door: "Main"
        };
        const response = await axios.post(WEBHOOK_URL, payload, { timeout: 5000 });
        console.log('[Test 2] Webhook SUCCESS!');
        console.log('[Test 2] Status:', response.status);
    } catch (err) {
        console.error('[Test 2] Webhook FAILED!');
        if (err.response) {
            console.error(`[Test 2] Status: ${err.response.status}`);
            console.error(`[Test 2] Data:`, err.response.data);
        } else {
            console.error(`[Test 2] Error: ${err.message}`);
        }
    }
}

async function run() {
    await testSync();
    await testWebhook();
}

run();
