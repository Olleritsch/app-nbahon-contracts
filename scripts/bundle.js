const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Validierung des kanonischen Team-Katalogs
const teamsJsonPath = path.join(rootDir, 'contracts', 'common', 'nba-teams.json');
const teamAbbrYamlPath = path.join(rootDir, 'contracts', 'common', 'schemas', 'TeamAbbreviation.yaml');

if (fs.existsSync(teamsJsonPath) && fs.existsSync(teamAbbrYamlPath)) {
  console.log('🔍 Validiere Konsistenz von nba-teams.json und TeamAbbreviation.yaml...');
  const teams = JSON.parse(fs.readFileSync(teamsJsonPath, 'utf8'));
  const teamAbbrYaml = fs.readFileSync(teamAbbrYamlPath, 'utf8');
  if (teams.length !== 30) {
    console.error(`❌ nba-teams.json muss exakt 30 Teams enthalten, gefunden: ${teams.length}`);
    process.exit(1);
  }
  teams.forEach(t => {
    if (!teamAbbrYaml.includes(`- ${t.abbreviation}`)) {
      console.error(`❌ TeamAbbreviation.yaml fehlt Team: ${t.abbreviation}`);
      process.exit(1);
    }
  });
  console.log('✅ Team-Katalog konsistent (30 Franchises).\n');
}

// Registry aller Verträge
const APIs = [
  {
    id: 'nbahon-connector-interface',
    title: 'Connector Interface (SPI) API',
    entry: path.join(rootDir, 'contracts', 'connectors', 'interface', 'v2', 'openapi.yaml')
  },
  {
    id: 'nbahon-core',
    title: 'Core BFF API',
    entry: path.join(rootDir, 'contracts', 'core', 'v1', 'openapi.yaml')
  },
  {
    id: 'nbahon-evaluation-game-winning-chance',
    title: 'GameWinningChance Evaluation API',
    entry: path.join(rootDir, 'contracts', 'evaluations', 'game-winning-chance', 'openapi.yaml')
  }
];

console.log('📦 Starte OpenAPI Bundling für alle APIs...\n');

APIs.forEach((api) => {
  if (!fs.existsSync(api.entry)) {
    console.warn(`⚠️  Eintragsdatei fehlt für ${api.id}: ${api.entry}`);
    return;
  }

  const content = fs.readFileSync(api.entry, 'utf8');
  const versionMatch = content.match(/version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)['"]?/);
  if (!versionMatch) {
    console.error(`❌ Keine SemVer-Version gefunden in: ${api.entry}`);
    process.exit(1);
  }
  const version = versionMatch[1];

  const outYaml = path.join(distDir, `${api.id}-v${version}.yaml`);
  const outJson = path.join(distDir, `${api.id}-v${version}.json`);
  const outLatestYaml = path.join(distDir, `${api.id}-latest.yaml`);
  const outLatestJson = path.join(distDir, `${api.id}-latest.json`);

  console.log(`➡️  Bündle ${api.title} (v${version})...`);
  execSync(`npx @redocly/cli bundle "${api.entry}" -o "${outYaml}"`, { stdio: 'inherit' });
  execSync(`npx @redocly/cli bundle "${api.entry}" -o "${outJson}"`, { stdio: 'inherit' });

  fs.copyFileSync(outYaml, outLatestYaml);
  fs.copyFileSync(outJson, outLatestJson);
});

console.log('\n✅ Bundling erfolgreich abgeschlossen!');
console.log('Folgende Artefakte wurden in dist/ erzeugt:');
fs.readdirSync(distDir).forEach((file) => {
  console.log(`   - dist/${file}`);
});
