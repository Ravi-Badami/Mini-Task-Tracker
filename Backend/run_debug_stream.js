const { spawn } = require('child_process');

console.log('Starting test execution...');
const child = spawn('npx.cmd', ['jest', 'src/__tests__/integration/api.test.ts', '--verbose=false'], { shell: true });

let buffer = '';
let capture = false;
let linesCaptured = 0;

child.stdout.on('data', (data) => {
  const str = data.toString();
  // console.log(str); // debug
  
  if (str.includes('Registration failed')) {
    capture = true;
    console.log('--- ERROR FOUND ---');
    console.log(str);
  } else if (capture) {
    console.log(str);
    linesCaptured++;
    if (linesCaptured > 20) capture = false;
  }
});

child.stderr.on('data', (data) => {
  const str = data.toString();
  console.log('STDERR:', str);
  if (str.includes('Registration failed')) {
    capture = true;
    console.log('--- ERROR FOUND IN STDERR ---');
    console.log(str);
  }
});

child.on('close', (code) => {
  console.log(`Test process exited with code ${code}`);
});
