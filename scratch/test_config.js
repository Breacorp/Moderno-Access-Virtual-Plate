const fs = require('fs');
const path = require('path');
const CONFIG_PATH = '/Users/joseluis/Proyectos/Placa_TNG201_virtual/config.json';

function getConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

let config = getConfig();
console.log('Original API URL:', config.board.modernoApiUrl);

config.board.modernoApiUrl = 'test.com';
saveConfig(config);

let updatedConfig = getConfig();
console.log('Updated API URL:', updatedConfig.board.modernoApiUrl);

// Revert
updatedConfig.board.modernoApiUrl = 'access.moderno.com.ar';
saveConfig(updatedConfig);
