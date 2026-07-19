const { spawn } = require('child_process');

console.log('[AI Studio Dev] Starting backend server on port 5000...');
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

console.log('[AI Studio Dev] Starting frontend Vite dev server on port 3000...');
const frontend = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', '--port', '3000', '--host', '0.0.0.0'], {
  cwd: 'frontend',
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  console.log('[AI Studio Dev] Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('exit', (code) => {
  console.log(`[AI Studio Dev] Backend exited with code ${code}`);
  frontend.kill();
  process.exit(code);
});

frontend.on('exit', (code) => {
  console.log(`[AI Studio Dev] Frontend exited with code ${code}`);
  backend.kill();
  process.exit(code);
});
