const { spawn } = require('child_process');

// 直接使用完整路径运行 vite
const vitePath = require('path').join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const nodePath = process.execPath; // 使用当前进程的 node 路径

const viteProcess = spawn(nodePath, [
  vitePath,
  '--mode', 'devlopment',
  '--host', '0.0.0.0'
], {
  cwd: __dirname,
  stdio: 'inherit'
});

viteProcess.on('close', (code) => {
  console.log(`vite process exited with code ${code}`);
});