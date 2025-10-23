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

api.on('error', (err) => {
  console.error('API process error:', err);
});

api.on('exit', (code) => {
  console.log(`API process exited with code ${code}`);
});

// Start Worker - temporarily disabled to fix permission issues
// const worker = spawn('npm', ['start'], { 
//   cwd: path.join(__dirname, 'worker'), 
//   stdio: 'inherit',
//   env: { ...process.env, NODE_ENV: 'production' }
// });

// worker.on('error', (err) => {
//   console.error('Worker process error:', err);
// });

// worker.on('exit', (code) => {
//   console.log(`Worker process exited with code ${code}`);
// });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down services...');
  api.kill();
  // worker.kill(); // disabled
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down services...');
  api.kill();
  // worker.kill(); // disabled
  process.exit(0);
});