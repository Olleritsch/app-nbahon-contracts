const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const openapiPath = path.join(rootDir, 'contracts', 'v1', 'openapi.yaml');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// 1. Version aus openapi.yaml ermitteln
const openapiContent = fs.readFileSync(openapiPath, 'utf8');
const versionMatch = openapiContent.match(/version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)['"]?/);
if (!versionMatch) {
  console.error('Konnte keine SemVer-Version in contracts/v1/openapi.yaml finden!');
  process.exit(1);
}
const version = versionMatch[1];
const major = version.split('.')[0];

console.log(`🚀 Bereite GitHub Pages für nbahon API Contracts v${version} vor...`);

// 2. Verzeichnisse anlegen
const semverDir = path.join(publicDir, `v${version}`);
const majorDir = path.join(publicDir, `v${major}`);
const latestDir = path.join(publicDir, 'latest');

[publicDir, semverDir, majorDir, latestDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 3. .nojekyll erstellen (verhindert Jekyll-Build auf GitHub Pages)
fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');

// 4. Quelldateien aus dist
const srcYaml = path.join(distDir, `nbahon-contracts-v${version}.yaml`);
const srcJson = path.join(distDir, `nbahon-contracts-v${version}.json`);

if (!fs.existsSync(srcYaml) || !fs.existsSync(srcJson)) {
  console.log('Dist-Dateien fehlen, führe Bundle aus...');
  execSync(`node "${path.join(__dirname, 'bundle.js')}"`, { stdio: 'inherit' });
}

// 5. In Zielverzeichnisse kopieren
const copyTargets = [
  // SemVer-Verzeichnis (z. B. public/v1.2.0/)
  [srcYaml, path.join(semverDir, 'nbahon-contracts.yaml')],
  [srcJson, path.join(semverDir, 'nbahon-contracts.json')],
  [srcYaml, path.join(semverDir, `nbahon-contracts-v${version}.yaml`)],
  [srcJson, path.join(semverDir, `nbahon-contracts-v${version}.json`)],

  // Major-Version Verzeichnis (z. B. public/v1/)
  [srcYaml, path.join(majorDir, 'nbahon-contracts.yaml')],
  [srcJson, path.join(majorDir, 'nbahon-contracts.json')],
  [srcYaml, path.join(majorDir, `nbahon-games-v${major}.yaml`)],
  [srcJson, path.join(majorDir, `nbahon-games-v${major}.json`)],

  // Latest-Verzeichnis (z. B. public/latest/)
  [srcYaml, path.join(latestDir, 'nbahon-contracts.yaml')],
  [srcJson, path.join(latestDir, 'nbahon-contracts.json')],
  [srcYaml, path.join(latestDir, 'nbahon-contracts-latest.yaml')],
  [srcJson, path.join(latestDir, 'nbahon-contracts-latest.json')],
  [srcYaml, path.join(latestDir, 'nbahon-games-latest.yaml')],
  [srcJson, path.join(latestDir, 'nbahon-games-latest.json')],

  // Root-Aliase (z. B. public/nbahon-contracts.yaml)
  [srcYaml, path.join(publicDir, 'nbahon-contracts.yaml')],
  [srcJson, path.join(publicDir, 'nbahon-contracts.json')]
];

for (const [src, dest] of copyTargets) {
  fs.copyFileSync(src, dest);
}

console.log('✅ GitHub Pages Artefakte in public/ erfolgreich vorbereitet.');

