const { spawn } = require('child_process');

console.log('Starting test execution...');
const child = spawn('npx.cmd', ['jest', 'src/__tests__/integration/api.test.ts', '--verbose=false'], { shell: true });

child.stdout.on('data', (data) => {
  const str = data.toString();
  if (str.includes('Mocked EmailService:')) {
    console.log(str);
  }
});

child.stderr.on('data', (data) => {
  // Suppress stderr unless it contains the mock log (unlikely)
});

child.on('close', (code) => {
  console.log(`Test process exited with code ${code}`);
});
