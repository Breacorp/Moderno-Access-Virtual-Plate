const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const auth = require('basic-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const CONFIG_PATH = path.join(__dirname, 'config.json');

// Middleware
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());

// Latency simulation middleware
app.use((req, res, next) => {
    const latency = parseInt(process.env.LATENCY_MS) || 0;
    if (latency > 0) {
        setTimeout(next, latency);
    } else {
        next();
    }
});

// Basic Auth Middleware
const checkAuth = (req, res, next) => {
    // If mode is 'unauthorized', enforce basic auth
    if (process.env.MODE === 'unauthorized') {
        const credentials = auth(req);
        const expectedUser = process.env.BOARD_USER || 'admin';
        const expectedPass = process.env.BOARD_PASS || 'admin';

        if (!credentials || credentials.name !== expectedUser || credentials.pass !== expectedPass) {
            res.set('WWW-Authenticate', 'Basic realm="Moderno Access"');
            return res.status(401).send('Unauthorized');
        }
    }
    next();
};

// Apply auth to simulated endpoints
app.use(['/status.htm', '/status.cgi', '/Scrt.htm', '/man.cgi', '/if.cgi'], checkAuth);

// Load Config
function getConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Authentic CSS from firmware
const AUTHENTIC_CSS = `
    .titlefont { color:#0066cc; font-family:Arial; font-weight:bold; }
    .cmdtitle { font-family:Arial; color:#3399CC; font-weight:bold; }
    .font-1 { font-family: Arial; font-size: 30px; color: #0066CC; }
    .font-2 { font-family: Arial; font-size: 20px; color: #000000; }
    .font-3 { font-family: Arial; font-size: 14px; font-weight: bold; color: #000000; }
    .font-4 { font-family: Arial; font-size: 12px; color: #000000; }
    table { border-collapse: collapse; width: 100%; border: 1px solid #CCCCCC; }
    th { background-color: #3399CC; color: white; padding: 5px; text-align: left; }
    td { border: 1px solid #CCCCCC; padding: 5px; }
`;

function wrapLegacy(title, content) {
    return `
        <html>
        <head>
            <title>${title}</title>
            <style>${AUTHENTIC_CSS}</style>
        </head>
        <body style="margin:20px;">
            <div class="font-1">${title}</div>
            <hr color="#0066CC">
            ${content}
        </body>
        </html>
    `;
}

// Endpoints
app.get(['/', '/index.htm'], (req, res) => {
    res.send(wrapLegacy('Welcome to TNG PRO', '<p class="font-2">Select a menu option to continue.</p>'));
});

app.get('/status.htm', (req, res) => {
    const config = getConfig();
    const content = `
        <div class="cmdtitle">System Status</div>
        <table>
            <tr><td class="font-3">Product Name</td><td>${process.env.BOARD_TYPE || 'TNG PRO'}</td></tr>
            <tr><td class="font-3">Security State</td><td>${config.board.securityState}</td></tr>
            <tr><td class="font-3">Mode</td><td>${process.env.MODE}</td></tr>
        </table>
    `;
    res.send(wrapLegacy('Status Report', content));
});

app.get('/database.htm', (req, res) => {
    const config = getConfig();
    let table = '<table><tr><th>ID</th><th>Name</th><th>Card</th></tr>';
    config.users.forEach(u => {
        table += `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.card}</td></tr>`;
    });
    table += '</table>';
    res.send(wrapLegacy('User Database', table));
});

app.get('/AccLog.htm', (req, res) => {
    const config = getConfig();
    let table = '<table><tr><th>Time</th><th>User</th><th>Action</th><th>Door</th></tr>';
    config.logs.slice().reverse().forEach(l => {
        table += `<tr><td>${l.timestamp}</td><td>${l.user}</td><td>${l.action}</td><td>${l.door}</td></tr>`;
    });
    table += '</table>';
    res.send(wrapLegacy('Access Log', table));
});

// Generic routes for other detected files
const otherRoutes = [
    'Clock.htm', 'CmdBar.htm', 'Config.htm', 'EmpRcd.htm', 'FWUpgr.htm', 
    'SysCfg.htm', 'groups.htm', 'setgroup.htm', 'times.htm', 'holiday.htm', 
    'Door.htm', 'DSet.htm', 'Event.htm', 'UserLog.htm', 'SysLog.htm', 
    'Scrt.htm', 'Logout.htm'
];

otherRoutes.forEach(route => {
    app.get(`/${route}`, (req, res) => {
        res.send(wrapLegacy(route, `<p class="font-4">Simulated content for ${route}</p>`));
    });
});

app.get('/man.cgi', (req, res) => {
    const { type, securitystate } = req.query;
    let config = getConfig();

    console.log(`[ACTION] man.cgi: type=${type}, securitystate=${securitystate}`);

    if (type === 'door_on' && securitystate) {
        config.board.securityState = securitystate;
        // Simulate relay activation
        const doorIndex = securitystate.indexOf('1');
        if (doorIndex !== -1) {
            config.logs.push({
                timestamp: new Date().toISOString(),
                user: 'Remote Command',
                action: 'Door Opened',
                door: doorIndex + 1
            });
        }
        saveConfig(config);
        return res.send('OK');
    }

    if (type === 'door_status') {
        return res.send(`door_status=${config.doors.map(d => d.status).join(',')}`);
    }

    res.status(400).send('Invalid command');
});

app.get('/if.cgi', (req, res) => {
    const { type, page } = req.query;
    const config = getConfig();

    console.log(`[QUERY] if.cgi: type=${type}, page=${page}`);

    if (type === 'go_log_page') {
        // Return logs in a simple format (usually HTML table or specific text)
        let logHtml = '<table><tr><th>Time</th><th>User</th><th>Action</th></tr>';
        config.logs.slice().reverse().forEach(log => {
            logHtml += `<tr><td>${log.timestamp}</td><td>${log.user}</td><td>${log.action}</td></tr>`;
        });
        logHtml += '</table>';
        return res.send(logHtml);
    }

    if (type === 'go_user_page') {
        let userHtml = '<table><tr><th>ID</th><th>Name</th><th>Card</th></tr>';
        config.users.forEach(user => {
            userHtml += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.card}</td></tr>`;
        });
        userHtml += '</table>';
        return res.send(userHtml);
    }

    res.status(400).send('Invalid query');
});

// Admin API for the dashboard (not part of the simulated board API)
app.get('/api/state', (req, res) => {
    const config = getConfig();
    res.json({
        ...config,
        env: {
            mode: process.env.MODE,
            latency: process.env.LATENCY_MS,
            user: process.env.BOARD_USER,
            pass: process.env.BOARD_PASS
        }
    });
});

app.post('/api/config', (req, res) => {
    saveConfig(req.body);
    res.json({ success: true });
});

app.post('/api/mode', (req, res) => {
    const { mode, latency, user, pass } = req.body;
    if (mode) process.env.MODE = mode;
    if (latency !== undefined) process.env.LATENCY_MS = latency;
    if (user) process.env.BOARD_USER = user;
    if (pass) process.env.BOARD_PASS = pass;
    
    console.log(`[SIM] Configuration updated: mode=${process.env.MODE}, latency=${process.env.LATENCY_MS}`);
    res.json({ success: true, current: { 
        mode: process.env.MODE, 
        latency: process.env.LATENCY_MS,
        user: process.env.BOARD_USER,
        pass: process.env.BOARD_PASS
    }});
});

app.listen(PORT, () => {
    console.log(`Moderno Access Virtual Plate running at http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.MODE}`);
    console.log(`Relays: ${process.env.RELAYS}`);
});
