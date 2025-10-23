// start-all.js
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Automation Bot services...');

// Start API on Render's PORT
const api = spawn('npm', ['start'], { 
  cwd: path.join(__dirname, 'api'), 
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: process.env.PORT || 4000,
    NODE_ENV: 'production'
  }
});

// Start Worker  
const worker = spawn('npm', ['start'], { 
  cwd: path.join(__dirname, 'worker'), 
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down services...');
  api.kill();
  worker.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down services...');
  api.kill();
  worker.kill();
  process.exit(0);
});