async function fetchData() {
    try {
        const response = await fetch('/api/state');
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching state:', error);
    }
}

function updateUI(data) {
    // Update Security State Bits
    const bitsContainer = document.getElementById('security-state-bits');
    bitsContainer.innerHTML = '';
    [...data.board.securityState].forEach(bit => {
        const span = document.createElement('span');
        span.textContent = bit;
        if (bit === '1') span.style.color = 'var(--success)';
        bitsContainer.appendChild(span);
    });

    // Update Doors
    const doorsContainer = document.getElementById('doors-container');
    doorsContainer.innerHTML = '';
    data.doors.forEach(door => {
        const div = document.createElement('div');
        div.className = `door-item ${door.status === 'open' ? 'open' : ''}`;
        div.innerHTML = `
            <span class="door-name">${door.name}</span>
            <span class="door-status">${door.status.toUpperCase()}</span>
        `;
        doorsContainer.appendChild(div);
    });

    // Update Logs
    const logsBody = document.querySelector('#logs-table tbody');
    logsBody.innerHTML = '';
    data.logs.slice().reverse().slice(0, 50).forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
            <td>${log.user}</td>
            <td>${log.action}</td>
            <td>${log.door}</td>
        `;
        logsBody.appendChild(row);
    });

    // Update Users
    const usersBody = document.querySelector('#users-table tbody');
    usersBody.innerHTML = '';
    data.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.card}</td>
        `;
        usersBody.appendChild(row);
    });

    // Update Mode Indicator from Env
    if (data.env) {
        const dot = document.querySelector('#mode-indicator .dot');
        const text = document.querySelector('#mode-indicator .text');
        text.textContent = data.env.mode.toUpperCase();
        
        if (data.env.mode === 'online') {
            dot.style.background = 'var(--success)';
            dot.style.boxShadow = '0 0 10px var(--success)';
        } else if (data.env.mode === 'unauthorized') {
            dot.style.background = 'var(--accent-color)';
            dot.style.boxShadow = '0 0 10px var(--accent-color)';
        } else {
            dot.style.background = 'var(--error)';
            dot.style.boxShadow = '0 0 10px var(--error)';
        }

        // Sync inputs if not focused
        if (document.activeElement.id !== 'mode-select') document.getElementById('mode-select').value = data.env.mode;
        if (document.activeElement.id !== 'latency-input') document.getElementById('latency-input').value = data.env.latency;
        if (document.activeElement.id !== 'auth-user') document.getElementById('auth-user').value = data.env.user;
        if (document.activeElement.id !== 'auth-pass') document.getElementById('auth-pass').value = data.env.pass;
    }
}

async function updateMode() {
    const mode = document.getElementById('mode-select').value;
    const latency = document.getElementById('latency-input').value;
    const user = document.getElementById('auth-user').value;
    const pass = document.getElementById('auth-pass').value;

    try {
        const response = await fetch('/api/mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, latency: parseInt(latency), user, pass })
        });
        const result = await response.json();
        
        // Update indicator visual
        const dot = document.querySelector('#mode-indicator .dot');
        const text = document.querySelector('#mode-indicator .text');
        text.textContent = result.current.mode.toUpperCase();
        
        if (result.current.mode === 'online') {
            dot.style.background = 'var(--success)';
            dot.style.boxShadow = '0 0 10px var(--success)';
        } else if (result.current.mode === 'unauthorized') {
            dot.style.background = 'var(--accent-color)';
            dot.style.boxShadow = '0 0 10px var(--accent-color)';
        } else {
            dot.style.background = 'var(--error)';
            dot.style.boxShadow = '0 0 10px var(--error)';
        }

        alert('Simulation updated!');
    } catch (error) {
        console.error('Error updating mode:', error);
    }
}

// Poll for updates every 2 seconds
setInterval(fetchData, 2000);
fetchData();
