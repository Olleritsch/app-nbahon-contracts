const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const contractsDir = path.join(publicDir, 'contracts');
const docsDir = path.join(publicDir, 'docs');

const APIs = [
  {
    id: 'nbahon-core',
    name: 'Core Orchestrator & BFF API',
    description: 'Upstream Frontend-Facing Schnittstelle für Spieltage, Matchup-Details und aggregierte Analysen.',
    entry: path.join(rootDir, 'contracts', 'core', 'v1', 'openapi.yaml'),
    docsSubdir: 'core'
  },
  {
    id: 'nbahon-connector-interface',
    name: 'Connector Interface (SPI) API',
    description: 'Standardisiertes Downstream-Interface für alle Daten-Konnektoren zur Bereitstellung einheitlicher NBA-Rohdaten.',
    entry: path.join(rootDir, 'contracts', 'connectors', 'interface', 'v2', 'openapi.yaml'),
    docsSubdir: 'connector-interface'
  }
];

console.log('🚀 Bereite GitHub Pages vor...');

// Vorbereitung sauberer Zielordner
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
[publicDir, contractsDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');

const renderedApis = [];

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

  const distYaml = path.join(distDir, `${api.id}-v${version}.yaml`);
  const distJson = path.join(distDir, `${api.id}-v${version}.json`);
  if (!fs.existsSync(distYaml) || !fs.existsSync(distJson)) {
    console.log(`Dist-Dateien fehlen für ${api.id}, führe Bundle aus...`);
    execSync(`node "${path.join(__dirname, 'bundle.js')}"`, { stdio: 'inherit' });
  }

  // 1. Spezifikationen in public/contracts/ ablegen
  fs.copyFileSync(distYaml, path.join(contractsDir, `${api.id}-v${version}.yaml`));
  fs.copyFileSync(distJson, path.join(contractsDir, `${api.id}-v${version}.json`));
  fs.copyFileSync(distYaml, path.join(contractsDir, `${api.id}-latest.yaml`));
  fs.copyFileSync(distJson, path.join(contractsDir, `${api.id}-latest.json`));

  // 2. Interaktive Redoc Doku generieren
  const apiDocsDir = path.join(docsDir, api.docsSubdir);
  if (!fs.existsSync(apiDocsDir)) fs.mkdirSync(apiDocsDir, { recursive: true });
  console.log(`📖 Erzeuge Redoc-Dokumentation für ${api.name}...`);
  execSync(`npx @redocly/cli build-docs "${distYaml}" -o "${path.join(apiDocsDir, 'index.html')}"`, { stdio: 'inherit' });

  renderedApis.push({ ...api, version });
});

// 3. HTML Landing Page generieren
const landingHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>nbahon OpenAPI Contracts & API Portal</title>
  <style>
    :root { --primary: #0284c7; --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --muted: #94a3b8; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; color: #38bdf8; }
    p.subtitle { color: var(--muted); font-size: 1.1rem; }
    .grid { display: grid; gap: 1.5rem; }
    .card { background: var(--card); border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; transition: border-color 0.2s; }
    .card:hover { border-color: var(--primary); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .badge { background: #0369a1; color: white; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; }
    .btn { display: inline-block; background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500; margin-right: 0.5rem; margin-bottom: 0.5rem; }
    .btn-secondary { background: #334155; }
    .btn:hover { opacity: 0.9; }
    .urls { margin-top: 1rem; background: #0b1120; padding: 0.75rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; word-break: break-all; }
    footer { text-align: center; margin-top: 3rem; color: var(--muted); font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏀 nbahon API Contract Registry</h1>
      <p class="subtitle">Zentrales, standardkonformes OpenAPI 3.1 Schnittstellenportal</p>
    </header>
    <div class="grid">
      ${renderedApis.map(api => `
        <div class="card">
          <div class="card-header">
            <h2 style="margin: 0;">${api.name}</h2>
            <span class="badge">v${api.version}</span>
          </div>
          <p style="color: var(--muted);">${api.description}</p>
          <div style="margin-top: 1.25rem;">
            <a class="btn" href="docs/${api.docsSubdir}/index.html">📖 Interaktive Dokumentation</a>
            <a class="btn btn-secondary" href="contracts/${api.id}-v${api.version}.yaml" download>⬇️ YAML (v${api.version})</a>
            <a class="btn btn-secondary" href="contracts/${api.id}-latest.yaml">🔗 Latest YAML</a>
          </div>
          <div class="urls">
            <strong>Maven / Codegen URL:</strong><br>
            https://olleritsch.github.io/app-nbahon-contracts/contracts/${api.id}-v${api.version}.yaml
          </div>
        </div>
      `).join('')}
    </div>
    <footer>
      nbahon-Ökosystem &bull; Entwickelt von Oliver (@Olleritsch) &bull; Standardkonform nach RFC 9457 & OpenAPI 3.1
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), landingHtml);
console.log('✅ GitHub Pages Portal erfolgreich in public/ generiert!');
