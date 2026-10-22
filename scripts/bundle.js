const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const openapiPath = path.join(rootDir, 'contracts', 'v1', 'openapi.yaml');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Version aus openapi.yaml ermitteln
const openapiContent = fs.readFileSync(openapiPath, 'utf8');
const versionMatch = openapiContent.match(/version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)['"]?/);
if (!versionMatch) {
  console.error('Konnte keine SemVer-Version in contracts/v1/openapi.yaml finden!');
  process.exit(1);
}
const version = versionMatch[1];
const major = version.split('.')[0];

console.log(`📦 Bündle nbahon API Contracts v${version} (Major: v${major})...`);

const primaryYaml = path.join(distDir, `nbahon-contracts-v${version}.yaml`);
const primaryJson = path.join(distDir, `nbahon-contracts-v${version}.json`);

// 2. Redocly Bundle ausführen
execSync(`npx redocly bundle "${openapiPath}" -o "${primaryYaml}"`, { stdio: 'inherit' });
execSync(`npx redocly bundle "${openapiPath}" -o "${primaryJson}"`, { stdio: 'inherit' });

// 3. Aliase und Abwärtskompatibilitäts-Dateien anlegen
const copyMap = [
  // Major-Version Aliase
  [primaryYaml, path.join(distDir, `nbahon-contracts-v${major}.yaml`)],
  [primaryJson, path.join(distDir, `nbahon-contracts-v${major}.json`)],
  // Latest Aliase
  [primaryYaml, path.join(distDir, 'nbahon-contracts-latest.yaml')],
  [primaryJson, path.join(distDir, 'nbahon-contracts-latest.json')],
  // Legacy Fallback (nbahon-games-v1)
  [primaryYaml, path.join(distDir, `nbahon-games-v${major}.yaml`)],
  [primaryJson, path.join(distDir, `nbahon-games-v${major}.json`)]
];

for (const [src, dest] of copyMap) {
  fs.copyFileSync(src, dest);
}

console.log('✅ Folgende Artefakte wurden in dist/ erzeugt:');
fs.readdirSync(distDir).forEach((file) => {
  console.log(`   - dist/${file}`);
});

