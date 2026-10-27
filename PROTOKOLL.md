# Gedächtnisprotokoll & Projektstatus: app-nbahon-contracts

> **Zweck dieses Dokuments:** Lückenlose Dokumentation des aktuellen Entwicklungsstands, der Multi-API-Architektur, der getroffenen Entscheidungen und der nächsten Schritte vor einem Neustart des Devcontainers/der Entwicklungsumgebung.

**Stand:** 27. Oktober 2026  
**Architektur:** Multi-API Contract Hub (OpenAPI 3.1)  
**Aktueller Git-Branch:** `main`  
**Registrierte APIs:**
- `nbahon-connector-interface` (Version: `2.0.0`)
- `nbahon-core` (Version: `1.1.0`)

---

## 1. Projektübersicht

`app-nbahon-contracts` ist die **Single Source of Truth** für alle Schnittstellenverträge im nbahon-Ökosystem (OpenAPI 3.1).
Das Repository beherbergt als Multi-API Hub:
- Das standardisierte, anbieterunabhängige **Downstream-Connector-Interface (`nbahon-connector-interface`)**, das als Service Provider Interface (SPI) von allen Datenkonnektoren (NatStat, ESPN, NBA.com usw.) als Anti-Corruption Layer (ACL) implementiert wird.
- Den **Upstream-BFF-Vertrag (`nbahon-core`)** für Frontend-Clients und Orchestrierung.

Alle Verträge werden modular gepflegt (`paths/` und `schemas/`), per Redocly gebündelt und automatisiert über ein modernes GitHub Pages Portal sowie GitHub Releases bereitgestellt.

---

## 2. Struktur der API-Verträge (`contracts/`)

```text
contracts/
├── connectors/
│   └── interface/
│       └── v2/                          <-- Standard Connector Interface (SPI) (v2.0.0)
│           ├── openapi.yaml
│           ├── paths/
│           │   ├── gameday.yaml         (GET /api/gamedays/{date})
│           │   ├── game.yaml            (GET /api/gamedays/{date}/games/{matchup})
│           │   ├── boxscore.yaml        (GET /api/gamedays/{date}/games/{matchup}/boxscore)
│           │   ├── playbyplay.yaml      (GET /api/gamedays/{date}/games/{matchup}/playbyplay)
│           │   └── teams.yaml           (GET /api/teams)
│           └── schemas/
│               ├── Gameday.yaml
│               ├── Game.yaml
│               ├── PlayByPlay.yaml
│               ├── Boxscore.yaml
│               ├── TeamGameStats.yaml
│               ├── PlayerBoxscore.yaml
│               ├── Team.yaml
│               ├── Score.yaml
│               ├── Venue.yaml
│               ├── GameStatus.yaml
│               └── ProblemDetail.yaml
└── core/
    └── v1/                              <-- Core Orchestrator & BFF API (v1.1.0)
        ├── openapi.yaml
        ├── paths/
        │   ├── gamedays.yaml            (GET /api/v1/core/gamedays/{date})
        │   └── games.yaml               (GET /api/v1/core/games/{date}/{matchup})
        └── schemas/
            ├── Gameday.yaml
            ├── Game.yaml
            ├── Team.yaml
            ├── Score.yaml
            └── ProblemDetail.yaml
```

---

## 3. Build-, Validierungs- und Bereitstellungsarchitektur

```mermaid
flowchart TD
    subgraph Repositories["contracts/"]
        CoreSpec["contracts/core/v1/openapi.yaml"]
        ConnectorSpec["contracts/connectors/interface/v2/openapi.yaml"]
    end

    subgraph BuildPipeline["Build & Distribution Pipeline"]
        Bundle["node scripts/bundle.js"]
        Lint["spectral lint (Spectral Ruleset)"]
        PagesPrep["node scripts/prepare-pages.js"]
    end

    subgraph DistOutput["dist/ (Release Artefakte)"]
        DistCore["nbahon-core-v1.1.0.(yaml|json)<br/>nbahon-core-latest.(yaml|json)"]
        DistConnector["nbahon-connector-interface-v2.0.0.(yaml|json)<br/>nbahon-connector-interface-latest.(yaml|json)"]
    end

    subgraph PagesOutput["public/ (GitHub Pages Portal)"]
        IndexHtml["index.html (API Registry Portal)"]
        DocsCore["docs/core/index.html (Redoc)"]
        DocsConnector["docs/connector-interface/index.html (Redoc)"]
        ContractsDown["contracts/*.yaml & *.json"]
    end

    Repositories --> Bundle
    Bundle --> DistOutput
    DistOutput --> Lint
    DistOutput --> PagesPrep
    PagesPrep --> PagesOutput
```

### A. Bundling (`scripts/bundle.js`)
Liest alle registrierten APIs aus, ermittelt dynamisch die SemVer-Version und erzeugt in `dist/`:
- `nbahon-core-v1.1.0.yaml` & `.json`
- `nbahon-core-latest.yaml` & `.json`
- `nbahon-connector-interface-v2.0.0.yaml` & `.json`
- `nbahon-connector-interface-latest.yaml` & `.json`

### B. GitHub Pages Portal (`scripts/prepare-pages.js`)
Erzeugt die statische Webpräsenz in `public/`:
- **Portal Landing Page:** `https://olleritsch.github.io/app-nbahon-contracts/`
- **Interaktive Redoc Dokumentationen:**
  - Core BFF: `https://olleritsch.github.io/app-nbahon-contracts/docs/core/`
  - Connector Interface: `https://olleritsch.github.io/app-nbahon-contracts/docs/connector-interface/`
- **Direkt-Download & Codegen-URLs (SemVer Pinned & Latest):**
  - Core v1.1.0: `https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-core-v1.1.0.yaml`
  - Core Latest: `https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-core-latest.yaml`
  - Connector Interface v2.0.0: `https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-connector-interface-v2.0.0.yaml`
  - Connector Interface Latest: `https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-connector-interface-latest.yaml`

---

## 4. GitHub Actions Workflows

1. **`.github/workflows/pages.yml`**:
   - Triggert bei Pushes auf `main` und bei Tags `v*`.
   - Baut alle Contracts und Dokumentationen (`npm run build:pages`) und veröffentlicht sie auf GitHub Pages.
2. **`.github/workflows/lint-and-validate.yml`**:
   - Triggert bei Pull Requests und Pushes auf `develop`.
   - Führt Bündelung und Spectral Linting durch (`npm test`).
   - Führt oasdiff Breaking-Change-Prüfung gegen den `main`-Branch für alle APIs aus.
3. **`.github/workflows/release.yml`**:
   - Triggert bei Tags `v*`.
   - Bündelt alle Verträge und lädt die Artefakte aus `dist/*` in das GitHub Release hoch.

---

## 5. Wichtige Befehle zur lokalen Validierung

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Verträge aller APIs bündeln
npm run bundle

# 3. Spectral Linting ausführen
npm run lint

# 4. Gesamter Build- & Testablauf (Bundle + Lint)
npm test

# 5. Interaktive HTML-Dokus & Portal in public/ generieren
npm run build:pages

# 6. Live-Vorschau im Browser starten
npm run preview:core          # Core BFF API
npm run preview:connector     # Connector Interface (SPI) API
```

---

## 6. Nächste Schritte

1. **Konsumierende Services anbinden bzw. umstellen:**
   - In `app-nbahon-natstat-connector` in der `pom.xml` die URL auf die neue Schnittstelle umstellen:
     ```xml
     <inputSpec>https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-connector-interface-v2.0.0.yaml</inputSpec>
     ```
   - Im `app-nbahon-core` Repo die Core-Spezifikation für DTO-/Interface-Generierung einbinden:
     ```xml
     <inputSpec>https://olleritsch.github.io/app-nbahon-contracts/contracts/nbahon-core-v1.1.0.yaml</inputSpec>
     ```
