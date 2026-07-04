import { join } from 'path';
import { execSync } from 'child_process';

const distDir = join(process.cwd(), 'dist');
const outZip = join(process.cwd(), 'fenicia-v1.zip');

try {
  if (process.platform === 'win32') {
    execSync(
      `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${outZip}' -Force"`,
      { stdio: 'inherit' },
    );
  } else {
    execSync(`cd "${distDir}" && zip -r "${outZip}" .`, { stdio: 'inherit' });
  }
  console.log(`\nCreated ${outZip} — ready for itch.io upload`);
} catch {
  console.error('Zip failed. Run manually: cd dist && zip -r ../fenicia-v1.zip .');
  process.exit(1);
}
