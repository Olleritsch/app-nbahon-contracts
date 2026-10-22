# Entwickler-Leitfaden: Konsumierung der nbahon API Contracts

Dieses Repository (`app-nbahon-contracts`) fungiert als **Single Source of Truth** für alle Schnittstellenverträge im nbahon-Ökosystem.
Microservices, Gateways und Frontend-Clients beziehen die Verträge zur Build-Zeit direkt als versionierte OpenAPI-Spezifikationen.

---

## 1. Bezug der Verträge über GitHub Pages (Empfohlen)

GitHub Pages fungiert als performantes statisches CDN und Dokumentationsportal:
- **Basis-URL:** `https://olleritsch.github.io/app-nbahon-contracts/`
- **Interaktive API-Dokumentation im Browser:** `https://olleritsch.github.io/app-nbahon-contracts/`

### Verfügbare CDN Download-URLs:

| Typ | URL | Verwendung / Zweck |
|---|---|---|
| **SemVer (Pinned)** | `https://olleritsch.github.io/app-nbahon-contracts/v1.2.0/nbahon-contracts.yaml` | Feste, unveränderliche Version (empfohlen für Production Microservices) |
| **Vollversioniert** | `https://olleritsch.github.io/app-nbahon-contracts/v1.2.0/nbahon-contracts-v1.2.0.yaml` | Alternative mit Versionsnummer im Dateinamen |
| **Evergreen (Latest)** | `https://olleritsch.github.io/app-nbahon-contracts/latest/nbahon-contracts.yaml` | Zeigt stets auf den neuesten Entwicklungs-/Release-Stand |
| **Major Evergreen** | `https://olleritsch.github.io/app-nbahon-contracts/v1/nbahon-contracts.yaml` | Bleibt stabil auf der neuesten `v1.x.y` Version |
| **Legacy Fallback** | `https://olleritsch.github.io/app-nbahon-contracts/v1/nbahon-games-v1.yaml` | Rückwärtskompatibilität für ältere Connectors |

*(Alle Pfade stehen analog auch mit `.json`-Dateiendung zur Verfügung).*

---

## 2. Bezug über GitHub Release Assets (Alternative)

Bei jedem Release-Tag (z. B. `v1.2.0`) erzeugt die GitHub Actions Pipeline automatisch konsolidierte Artefakte unter den GitHub Releases:
- `nbahon-contracts-v1.2.0.yaml` / `.json` (Vollversioniert)
- `nbahon-contracts-v1.yaml` / `.json` (Major Alias)
- `nbahon-contracts-latest.yaml` / `.json` (Latest Alias)
- `nbahon-games-v1.yaml` / `.json` (Legacy Fallback)

Die permanente Release-Download-URL lautet:
```text
https://github.com/Olleritsch/app-nbahon-contracts/releases/download/<TAG>/nbahon-contracts-v1.2.0.yaml
```

---

## 3. Einbindung in Java / Spring Boot Microservices (`pom.xml`)

Im Microservice (z. B. `app-nbahon-natstat-connector`) wird das `openapi-generator-maven-plugin` konfiguriert:

```xml
<plugin>
    <groupId>org.openapitools</groupId>
    <artifactId>openapi-generator-maven-plugin</artifactId>
    <version>7.12.0</version>
    <executions>
        <execution>
            <id>generate-nbahon-contracts</id>
            <goals>
                <goal>generate</goal>
            </goals>
            <configuration>
                <!-- URL zum Contract via GitHub Pages (CDN) -->
                <inputSpec>https://olleritsch.github.io/app-nbahon-contracts/v1.2.0/nbahon-contracts.yaml</inputSpec>
                <generatorName>spring</generatorName>
                <library>spring-boot</library>
                <apiPackage>click.dempster.nbahon.contracts.v1.api</apiPackage>
                <modelPackage>click.dempster.nbahon.contracts.v1.model</modelPackage>
                <configOptions>
                    <useSpringBoot3>true</useSpringBoot3>
                    <reactive>true</reactive>
                    <interfaceOnly>true</interfaceOnly>
                    <skipDefaultInterface>true</skipDefaultInterface>
                    <useTags>true</useTags>
                    <openApiNullable>false</openApiNullable>
                </configOptions>
            </configuration>
        </execution>
    </executions>
</plugin>
```

> **Hinweis bei privaten Repositories:**  
> Für den Download aus privaten Repositories kann entweder ein GitHub Personal Access Token (PAT) im Header übergeben werden oder das Asset wird im CI-Runner vor dem Build heruntergeladen (z. B. via `gh release download`).

---

## 4. Generierung von Client SDKs (Frontend / Mobile)

### TypeScript / Axios
```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://olleritsch.github.io/app-nbahon-contracts/v1.2.0/nbahon-contracts.yaml \
  -g typescript-axios \
  -o ./generated/client
```

### Dart / Flutter
```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://olleritsch.github.io/app-nbahon-contracts/v1.2.0/nbahon-contracts.yaml \
  -g dart-dio \
  -o ./generated/client
```

---

## 5. Versionierungs- und Lifecycle-Regeln

Wir folgen strikt dem [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):

| Änderung | SemVer-Sprung | Beispiel | Auswirkung auf Clients |
|---|---|---|---|
| Reine Beschreibungen, Tippfehler, optionale Doku-Felder | **Patch** (`1.0.x`) | `v1.0.1` | Keine Code-Änderungen erforderlich |
| Neues optionales Feld, neuer Endpunkt, neue Enum-Werte (abwärtskompatibel) | **Minor** (`1.x.0`) | `v1.1.0` | Abwärtskompatibel, keine Breaking Changes |
| Pflichtfeld hinzugefügt, Feld umbenannt/gelöscht, geänderte Datentypen | **Major** (`x.0.0`) | `v2.0.0` | Breaking Change; Erfordert Anpassung und neuen Versionspfad (`contracts/v2/`) |

---

## 6. Lokale Entwicklung & Validierung von Änderungen

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Linting (Spectral):**
   ```bash
   npm run lint
   ```

3. **Bündeln (Redocly mit voller SemVer & Aliase):**
   ```bash
   npm run bundle
   ```

4. **GitHub Pages & HTML-Doku lokal bauen:**
   ```bash
   npm run build:pages
   ```

5. **Kombinierter Testlauf:**
   ```bash
   npm test
   ```

6. **Interaktive Vorschau im Browser:**
   ```bash
   npm run preview
   ```

