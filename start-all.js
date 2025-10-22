// start-all.js
const { spawn } = require('child_process');

// Start API
const api = spawn('npm', ['start'], { cwd: './api', stdio: 'inherit' });

// Start Worker  
const worker = spawn('npm', ['start'], { cwd: './worker', stdio: 'inherit' });

// Start Web (served by API in production)
// The API will serve the built web files

process.on('SIGTERM', () => {
  api.kill();
  worker.kill();
});