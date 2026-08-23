# Fix: "Office.js has not fully loaded" in Word 1808 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beheben der Office.js-Initialisierungsfehlermeldung "Office.js has not fully loaded. Your app must call 'Office.onReady()' as part of it's loading sequence" beim Aufruf des Add-ins in Word 1808 (August 2018, IE11-WebView). Word 365 funktioniert bereits korrekt.

**Architecture:** Die Ursache ist, dass der mit Vite 7 erzeugte Build ausschließlich ES-Module liefert (`<script type="module">`), die von der IE11-WebView in Word 1808 ignoriert werden. Dadurch wird `main.ts` nie geladen, `Office.onReady()` nie aufgerufen und Office.js wirft die genannte Meldung. Lösung: entweder IE11-Kompatibilität wiederherstellen, Word 1808 offiziell ausschließen, oder eine deutsche Hinweismeldung anzeigen.

**Tech Stack:** Vite 7.3, Vue 3.5, Office.js v1, TypeScript 5.8, manifest.xml v1.1.

---

## Root-Cause-Analyse (vor der Implementation gelesen)

**Befund:**
- `src/main.ts:10` ruft `window.Office.onReady(...)` korrekt auf
- `index.html:10` und `dist/index.html:10` enthalten `<script type="module" crossorigin src="...">`
- `vite.config.js` enthält **kein** `@vitejs/plugin-legacy` → kein `nomodule`-Fallback
- Vite 7 zielt standardmäßig auf moderne Browser (ES2020+)
- Codebasis nutzt optional chaining, async/await, nullish coalescing — IE11 kann das nicht parsen

**Warum Word 1808 fehlschlägt:**
1. Word 1808 nutzt Trident/IE11-WebView
2. IE11 ignoriert `<script type="module">` ohne `nomodule`-Fallback
3. `main.js` wird nie geladen → `Office.onReady()` nie aufgerufen
4. Office.js erkennt nach Page-Load das Fehlen der Initialisierung und wirft die Meldung
5. "Zeile 76" der Fehlermeldung verweist auf die interne Office.js-Datei, nicht auf eigenen Code

**Warum Word 365 funktioniert:** Edge/Chromium-WebView2 unterstützt ES-Module nativ.

---

## Decision Needed (vor Task-Start)

Drei Wege stehen zur Wahl. **Genau einen wählen, dann nur die zugehörigen Tasks abarbeiten.**

| Option | Was passiert | Aufwand | Bundle-Größe | 1808 funktioniert? |
|--------|-------------|---------|--------------|---------------------|
| **A** | `@vitejs/plugin-legacy` einbinden, IE11-Bundle erzeugen | mittel | +30-50% | ja |
| **B** | Manifest-Requirements härten, alte Word-Versionen schließen Add-in selbst aus | klein | unverändert | nein (kontrolliert abgelehnt) |
| **C** | Inline-Skript in `index.html`, das ES-Module erkennt und sonst deutsche Hinweismeldung anzeigt | sehr klein | unverändert | nein (klare Fehlermeldung statt Office.js-Fehler) |

**Empfehlung:** Option B, falls 1808 nicht business-kritisch ist (Word 1808 ist seit 2023 EOL). Option A nur wenn aktive 1808-Nutzer existieren.

---

## Option A: Vollständiger Word-1808-Support via Legacy-Plugin

### Task A1: Plugin installieren

**Files:**
- Modify: `package.json` (devDependencies)
- Modify: `package-lock.json` (auto)

- [ ] **Step 1: Plugin installieren**

```bash
npm install --save-dev @vitejs/plugin-legacy terser
```

Erwartung: zwei neue Einträge unter `devDependencies` in `package.json`.

- [ ] **Step 2: Verifizieren**

```bash
grep -E '"@vitejs/plugin-legacy"|"terser"' package.json
```

Erwartung: beide Pakete erscheinen.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @vitejs/plugin-legacy for IE11/Word 1808 support"
```

### Task A2: Vite-Konfiguration erweitern

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Aktuelle vite.config.js sichten**

```bash
cat vite.config.js
```

Erwartung: Aktueller Inhalt (17 Zeilen) ist bekannt.

- [ ] **Step 2: Legacy-Plugin einbinden**

Ersetze den Inhalt von `vite.config.js` durch:

```js
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'
import json5Plugin from 'vite-plugin-json5'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    json5Plugin(),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  build: {
    target: 'es2015',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      async_hook: fileURLToPath(new URL('./async_hook.js', import.meta.url)),
      'node:async_hooks': fileURLToPath(new URL('./async_hook.js', import.meta.url)),
    },
  },
})
```

- [ ] **Step 3: Build laufen lassen**

```bash
npm run build
```

Erwartung: Build endet ohne Fehler. Ausgabe enthält jetzt zwei Bundles (modern + legacy) und einen `<script nomodule>`-Tag in `dist/index.html`.

- [ ] **Step 4: dist/index.html prüfen**

```bash
grep -E 'type="module"|nomodule' dist/index.html
```

Erwartung: mindestens je ein `type="module"`- und ein `nomodule`-Skript-Tag.

- [ ] **Step 5: Commit**

```bash
git add vite.config.js
git commit -m "build: enable legacy IE11 build for Word 1808 compatibility"
```

### Task A3: Office.initialize-Fallback in main.ts ergänzen

**Files:**
- Modify: `src/main.ts`

Hintergrund: Ältere Office.js-Hosts erwarten `Office.initialize` zusätzlich zu `Office.onReady`. Beide setzen ist offizielle Microsoft-Empfehlung für Rückwärtskompatibilität.

- [ ] **Step 1: main.ts aktualisieren**

Ersetze den Inhalt von `src/main.ts` durch:

```ts
import 'element-plus/dist/index.css'

import ElementUI from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'
import { i18n } from './i18n'
import router from './router'

function bootstrap() {
  const app = createApp(App)
  const debounce = (fn: (...args: any[]) => void, delay?: number) => {
    let timer: number | null = null
    return function (this: unknown, ...args: any[]) {
      const context = this

      if (timer !== null) clearTimeout(timer)
      timer = window.setTimeout(() => {
        fn.apply(context, args)
      }, delay)
    }
  }

  const _ResizeObserver = window.ResizeObserver
  if (_ResizeObserver) {
    window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        callback = debounce(callback, 16)
        super(callback)
      }
    }
  }
  app.use(i18n)
  app.use(router)
  app.use(ElementUI)
  app.mount('#app')
}

// Backwards-compat fallback für Word 1808 / Office.js älter als 1.6
;(window as any).Office = (window as any).Office || {}
;(window as any).Office.initialize = function () {
  // Kein-Op: Office.onReady übernimmt; reine Initialize-Marker für Office-Host
}

window.Office.onReady(() => {
  bootstrap()
})
```

- [ ] **Step 2: Build laufen lassen**

```bash
npm run build
```

Erwartung: Build erfolgreich, keine TS-Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "fix: add Office.initialize fallback for legacy Word hosts"
```

### Task A4: In Word 1808 testen

**Files:** keine Änderungen, reiner manueller Test.

- [ ] **Step 1: Dev-Server starten**

```bash
npm run dev
```

Oder Docker-Build laden, je nach Deployment-Workflow.

- [ ] **Step 2: Add-in in Word 1808 sideloaden**

Manifest `manifest-docker-3100.xml` in Word 1808 laden und Plugin starten.

Erwartung: Plugin-UI lädt, kein "Office.js has not fully loaded"-Fehler.

- [ ] **Step 3: Grundfunktion testen**

Im geladenen Add-in einen Text auswählen und z.B. "Übersetzen"-Aktion ausführen.

Erwartung: Word.run-Aufrufe funktionieren, kein Office.js-Fehler.

- [ ] **Step 4: Word 365 als Regression-Check**

Selber Build, in Word 365 laden und gleiche Aktion ausführen.

Erwartung: Funktioniert weiterhin wie zuvor.

---

## Option B: Word 1808 offiziell ausschließen via Manifest-Requirement

### Task B1: Manifest-Requirements härten

**Files:**
- Modify: `manifest-docker-3100.xml`
- Modify: ggf. weitere Manifeste (`release/`-Ordner prüfen)

Hintergrund: Word liest beim Sideload `<Requirements>` und lehnt das Add-in ab, wenn die geforderte WordApi-Version fehlt. Word 1808 unterstützt maximal WordApi 1.3. Setzen wir 1.4 oder höher, lehnt 1808 sauber ab.

- [ ] **Step 1: Manifest-Datei lesen, Stelle für Requirements finden**

```bash
grep -n "Requirements\|WordApi\|Hosts" manifest-docker-3100.xml
```

Erwartung: Position bekannt, an der `<Requirements>` ergänzt werden muss (direkt nach `</Hosts>`).

- [ ] **Step 2: Requirements-Element einfügen**

Direkt nach dem schließenden `</Hosts>`-Tag in `manifest-docker-3100.xml` ergänzen:

```xml
<Requirements>
  <Sets DefaultMinVersion="1.4">
    <Set Name="WordApi" MinVersion="1.4" />
  </Sets>
</Requirements>
```

WordApi 1.4 wird ab Word 2019 / Word 365 unterstützt; Word 1808 (max. WordApi 1.3) lehnt das Add-in ab.

- [ ] **Step 3: Manifest validieren**

```bash
npx office-addin-manifest validate manifest-docker-3100.xml
```

Erwartung: "The manifest is valid."

- [ ] **Step 4: Andere Manifeste finden**

```bash
find . -maxdepth 3 -name "manifest*.xml" -not -path "*/node_modules/*"
```

Erwartung: Liste aller Manifeste. Schritt 2 ggf. für jedes wiederholen.

- [ ] **Step 5: Commit**

```bash
git add manifest-docker-3100.xml
git commit -m "chore: require WordApi 1.4 to exclude Word 1808 cleanly"
```

### Task B2: In Word 1808 verifizieren

- [ ] **Step 1: Plugin in Word 1808 sideloaden**

Erwartung: Word zeigt eine klare Meldung "Dieses Add-in benötigt eine neuere Version von Word" oder ähnlich, kein Office.js-Initialisierungsfehler mehr.

- [ ] **Step 2: Word 365 als Regression-Check**

Erwartung: Plugin funktioniert weiterhin.

---

## Option C: Inline-Hinweismeldung für nicht unterstützte WebViews

### Task C1: Inline-Detection-Skript in index.html

**Files:**
- Modify: `index.html`

Hintergrund: Wir fügen ein klassisches `<script>` (kein `type="module"`) ein, das in IE11 läuft. Wir bauen die Hinweis-DOM-Struktur per `createElement`/`textContent` (kein `innerHTML`, daher XSS-sicher).

- [ ] **Step 1: index.html modifizieren**

Ersetze den `<head>`- und `<body>`-Bereich in `index.html` so:

```html
<!doctype html>
<html lang="">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="icon" href="/favicon.ico" />
    <title>OI & Mistral</title>
    <script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>
    <script>
      // Frühe Office.initialize-Registrierung verhindert den Generic-Loading-Fehler
      window.Office = window.Office || {};
      window.Office.initialize = function () { /* no-op marker */ };
    </script>
    <script type="module" src="/src/main.js"></script>
    <script nomodule>
      document.addEventListener('DOMContentLoaded', function () {
        var el = document.getElementById('app');
        if (!el) return;
        // Sichere DOM-Konstruktion ohne innerHTML
        var box = document.createElement('div');
        box.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        box.style.padding = '24px';
        box.style.color = '#2c3e50';
        box.style.textAlign = 'center';
        var h2 = document.createElement('h2');
        h2.textContent = 'Nicht unterstützte Word-Version';
        var p1 = document.createElement('p');
        p1.textContent = 'Dieses Add-in benötigt Word 2019 oder Word 365. ' +
          'Ihre Word-Version (z. B. Word 2018) verwendet eine veraltete Browser-Engine.';
        var p2 = document.createElement('p');
        p2.textContent = 'Bitte aktualisieren Sie Word, um das Plugin zu nutzen.';
        box.appendChild(h2);
        box.appendChild(p1);
        box.appendChild(p2);
        el.appendChild(box);
      });
    </script>
  </head>
  <body>
    <noscript>
      <strong
        >We're sorry but this app doesn't work properly without JavaScript
        enabled. Please enable it to continue.</strong
      >
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
```

- [ ] **Step 2: Build laufen lassen**

```bash
npm run build
```

Erwartung: Build erfolgreich, `dist/index.html` enthält weiterhin den `<script nomodule>`-Block.

- [ ] **Step 3: dist/index.html prüfen**

```bash
grep -A 2 "nomodule" dist/index.html
```

Erwartung: Der Hinweis-Block ist enthalten.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: show german fallback message in unsupported Word versions"
```

### Task C2: In Word 1808 verifizieren

- [ ] **Step 1: Plugin in Word 1808 sideloaden**

Erwartung: Statt "Office.js has not fully loaded" erscheint "Nicht unterstützte Word-Version" mit Hinweis zum Upgrade.

- [ ] **Step 2: Word 365 als Regression-Check**

Erwartung: Plugin funktioniert weiterhin normal.

---

## Hinweise für die Umsetzung

- Build-Output: `dist/index.html` und `dist/assets/index-*.js` werden bei jedem Build neu erzeugt, der Hash ändert sich.
- Die Datei `dist/PrivacyPage.html` muss ggf. ebenfalls geprüft werden, falls dort Office.js-Aufrufe stattfinden.
- Manifeste im `release/`-Ordner sind die produktiven Versionen — Änderungen an Manifest-Requirements (Option B) müssen dort konsistent gepflegt werden.
- Nach jeder Option den Docker-Build (`docker-compose build`) ausführen, da das Deployment per Docker erfolgt.

## Rollback

Alle drei Optionen sind rein additiv und können mit `git revert <commit>` zurückgenommen werden.
