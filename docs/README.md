# Entwickler-Leitfaden: Konsumierung der nbahon API Contracts

Dieses Repository (`app-nbahon-contracts`) fungiert als **Single Source of Truth** für alle Schnittstellenverträge im nbahon-Ökosystem.
Microservices, Gateways und Frontend-Clients beziehen die Verträge zur Build-Zeit direkt als versionierte OpenAPI-Spezifikationen.

---

## 1. Bezug der Verträge über GitHub Release Assets

Bei jedem Release-Tag (z. B. `v1.1.0`) erzeugt die GitHub Actions Pipeline automatisch konsolidierte (gebündelte) Artefakte:
- `nbahon-contracts-v1.yaml` (YAML-Format, primär)
- `nbahon-contracts-v1.json` (JSON-Format)
- `nbahon-games-v1.yaml` (YAML-Format, Fallback/Alias)
- `nbahon-games-v1.json` (JSON-Format, Fallback/Alias)

Die permanente Download-URL lautet:
```text
https://github.com/Olleritsch/app-nbahon-contracts/releases/download/<TAG>/nbahon-contracts-v1.yaml
```

Beispiel für Version `v1.1.0`:
```text
https://github.com/Olleritsch/app-nbahon-contracts/releases/download/v1.1.0/nbahon-contracts-v1.yaml
```

---

## 2. Einbindung in Java / Spring Boot Microservices (`pom.xml`)

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
                <!-- URL zum Release-Asset des Contracts-Repositorys -->
                <inputSpec>https://github.com/Olleritsch/app-nbahon-contracts/releases/download/v1.1.0/nbahon-contracts-v1.yaml</inputSpec>
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

## 3. Generierung von Client SDKs (Frontend / Mobile)

### TypeScript / Axios
```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://github.com/Olleritsch/app-nbahon-contracts/releases/download/v1.0.0/nbahon-games-v1.yaml \
  -g typescript-axios \
  -o ./generated/client
```

### Dart / Flutter
```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://github.com/Olleritsch/app-nbahon-contracts/releases/download/v1.0.0/nbahon-games-v1.yaml \
  -g dart-dio \
  -o ./generated/client
```

---

## 4. Versionierungs- und Lifecycle-Regeln

Wir folgen strikt dem [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):

| Änderung | SemVer-Sprung | Beispiel | Auswirkung auf Clients |
|---|---|---|---|
| Reine Beschreibungen, Tippfehler, optionale Doku-Felder | **Patch** (`1.0.x`) | `v1.0.1` | Keine Code-Änderungen erforderlich |
| Neues optionales Feld, neuer Endpunkt, neue Enum-Werte (abwärtskompatibel) | **Minor** (`1.x.0`) | `v1.1.0` | Abwärtskompatibel, keine Breaking Changes |
| Pflichtfeld hinzugefügt, Feld umbenannt/gelöscht, geänderte Datentypen | **Major** (`x.0.0`) | `v2.0.0` | Breaking Change; Erfordert Anpassung und neuen Versionspfad (`contracts/v2/`) |

---

## 5. Lokale Entwicklung & Validierung von Änderungen

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Linting (Spectral):**
   ```bash
   npm run lint
   ```

3. **Bundling (Redocly):**
   ```bash
   npm run bundle
   ```

4. **Kombinierter Testlauf:**
   ```bash
   npm test
   ```

5. **Interaktive Vorschau im Browser:**
   ```bash
   npm run preview
   ```

