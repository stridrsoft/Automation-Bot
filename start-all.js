// start-all.js
const { spawn } = require('child_process');
const path = require('path');

// Start API
const api = spawn('npm', ['start'], { 
  cwd: path.join(__dirname, 'api'), 
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 4000 }
});

// Start Worker  
const worker = spawn('npm', ['start'], { 
  cwd: path.join(__dirname, 'worker'), 
  stdio: 'inherit' 
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  api.kill();
  worker.kill();
  process.exit(0);
});