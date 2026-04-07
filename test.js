const { execSync } = require('child_process');

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return error.stdout ? error.stdout.toString().trim() : '';
  }
}

console.log(run('ls -l app/page.tsx'));
console.log(run('cat app/page.tsx | grep -i HeroSection'));
