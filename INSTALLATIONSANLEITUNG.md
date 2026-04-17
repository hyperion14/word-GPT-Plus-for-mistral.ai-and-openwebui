# Installationsanleitung - Word GPT Plus v2.0.1

## Voraussetzungen

| Was wird benoetigt | Details |
|-------------------|---------|
| **Microsoft Word** | Word 2016 oder neuer, Microsoft 365 oder Word Online |
| **Internetzugang** | Zugriff auf `https://wordai.hekanet.de` |
| **JWT-Token oder API-Key** | Aus Open WebUI (https://chat.bhk-x.de) |

---

## Installation (Schritt fuer Schritt)

### Windows - Word Desktop

#### Schritt 1: Manifest-Datei herunterladen

Lade die Datei `manifest-docker-3100.xml` herunter und speichere sie an einem beliebigen Ort auf deinem PC (z.B. auf dem Desktop oder in einem Ordner deiner Wahl).

#### Schritt 2: Add-In in Word laden

1. Oeffne **Microsoft Word**
2. Klicke oben im Menue auf den Reiter **Einfuegen**
3. Klicke auf **Meine Add-Ins** (oder **Add-Ins abrufen**)
4. Klicke oben rechts auf **Mein Add-In hochladen**
5. Waehle die heruntergeladene Datei `manifest-docker-3100.xml` aus
6. Klicke auf **Hochladen**

#### Schritt 3: Plugin starten

1. Wechsle zum Reiter **Start** (Home)
2. Rechts in der Menueleiste erscheint die Gruppe **GPT** mit dem Button **GPT Plus**
3. Klicke auf **GPT Plus** - der Seitenbereich oeffnet sich rechts

> **Hinweis:** Falls Word eine Sicherheitswarnung anzeigt, liegt es daran, dass das Add-In von einer externen Quelle geladen wird. Das ist normal und kann bestaetigt werden.

---

### Mac - Word Desktop

1. Oeffne **Word**
2. Gehe zu **Einfuegen** > **Add-Ins** > **Meine Add-Ins**
3. Klicke auf den Dropdown-Pfeil und waehle **Mein Add-In hochladen**
4. Waehle die Datei `manifest-docker-3100.xml` und klicke auf **Hochladen**
5. Das Plugin erscheint auf dem **Start**-Reiter als **GPT Plus** Button

---

### Word Online (Office 365 im Browser)

1. Oeffne Word Online unter https://www.office.com
2. Oeffne ein beliebiges Dokument
3. Gehe zu **Einfuegen** > **Office-Add-Ins**
4. Klicke oben rechts auf **Mein Add-In hochladen**
5. Lade die `manifest-docker-3100.xml` hoch

---

### Organisation (fuer alle Benutzer gleichzeitig)

Ein Administrator kann das Plugin fuer alle Benutzer zentral bereitstellen:

1. Gehe zum Microsoft 365 Admin Center: https://admin.microsoft.com
2. Navigiere zu **Einstellungen** > **Integrierte Apps** > **Benutzerdefinierte Apps hochladen**
3. Waehle **Office-Add-In**
4. Lade die `manifest-docker-3100.xml` hoch
5. Weise das Add-In bestimmten Benutzern oder der gesamten Organisation zu
6. Die Benutzer sehen **GPT Plus** automatisch in ihrem Word-Menueleiste

---

## Ersteinrichtung nach der Installation

### Schritt 1: Einstellungen oeffnen

1. Klicke auf **GPT Plus** im Start-Reiter, um das Plugin zu oeffnen
2. Klicke auf das **Zahnrad-Symbol** (oben rechts im Plugin-Fenster)

### Schritt 2: Provider konfigurieren

1. Gehe zum Tab **Provider**
2. Waehle im Dropdown **API Provider** den Eintrag **openwebui**
3. Trage folgende Werte ein:

| Feld | Wert |
|------|------|
| **Open-WebUI URL** | `https://chat.bhk-x.de` |
| **Plugin URL** | `https://wordai.hekanet.de` |
| **Instance** | `custom` |
| **JWT Token** | Dein persoenlicher Token (siehe naechster Abschnitt) |

4. Die **Base URL** wird automatisch berechnet

### Schritt 3: JWT-Token oder API-Key beschaffen

Du brauchst einen Token, damit das Plugin sich bei Open WebUI authentifizieren kann. Es gibt zwei Wege:

#### Variante A: API-Key erstellen (empfohlen - laeuft nicht ab)

1. Oeffne https://chat.bhk-x.de im Browser und melde dich an
2. Klicke unten links auf deinen **Avatar** > **Einstellungen**
3. Gehe zum Tab **Konto** (Account)
4. Scrolle zu **API-Schluessel** (API Keys)
5. Klicke auf **Neuen geheimen Schluessel erstellen**
6. Kopiere den Schluessel (beginnt mit `sk-...`)
7. Fuege ihn im Plugin unter **JWT Token** ein

#### Variante B: JWT-Token aus dem Browser (laeuft nach einiger Zeit ab)

1. Oeffne https://chat.bhk-x.de und melde dich an
2. Druecke **F12** um die Entwicklertools zu oeffnen
3. Gehe zu **Application** (Anwendung) > **Local Storage** > `https://chat.bhk-x.de`
4. Suche den Eintrag `token` und kopiere dessen Wert
5. Fuege ihn im Plugin unter **JWT Token** ein

### Schritt 4: Modell auswaehlen

1. Gehe zurueck zu den Provider-Einstellungen
2. Klicke auf den **Aktualisieren**-Button neben dem Modell-Dropdown
3. Die verfuegbaren Modelle werden geladen
4. Waehle ein Modell aus, z.B.:
   - `mistral-large-latest` - Grosses Modell, beste Qualitaet
   - `mistral-small-latest` - Kleines Modell, schnell
   - `aktenknecht` - BHK-eigenes Modell mit Dateisuche und Websuche

### Schritt 5: Verbindung testen

1. Gehe zurueck zur Startseite (Pfeil zurueck)
2. Tippe eine Testnachricht ein, z.B.: *"Hallo, was ist ein Werkvertrag?"*
3. Klicke auf **Senden**
4. Du solltest eine Antwort erhalten, die in Echtzeit eingeblendet wird

---

## Fehlerbehebung bei der Installation

### Word zeigt "Dieses Add-In kann nicht geoeffnet werden"

- Stelle sicher, dass du Internetzugang zu `https://wordai.hekanet.de` hast
- Oeffne die URL im Browser - du solltest die Plugin-Oberflaeche sehen
- Starte Word neu und versuche es erneut

### Der "GPT Plus" Button erscheint nicht

- Pruefe ob das Add-In korrekt geladen wurde: **Einfuegen** > **Meine Add-Ins**
- Falls es dort aufgelistet ist, klicke darauf, um es erneut zu aktivieren
- Versuche den Add-In-Cache zu loeschen:
  - **Windows:** Loesche den Ordner `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
  - **Mac:** Loesche `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`
- Starte Word neu

### "Kein API-Schluessel" Fehler beim Senden

- Gehe in die Einstellungen > Provider
- Stelle sicher, dass **openwebui** als Provider ausgewaehlt ist
- Pruefe, ob das **JWT Token** Feld ausgefuellt ist
- Falls der Token abgelaufen ist: erstelle einen neuen API-Key (Variante A oben)

### Modelle werden nicht geladen

1. Klicke auf den **Aktualisieren**-Button neben dem Modell-Dropdown
2. Pruefe, ob die Base URL korrekt gesetzt ist
3. Stelle Instance auf `custom` und Open-WebUI URL auf `https://chat.bhk-x.de`
4. Pruefe, ob dein JWT-Token noch gueltig ist

### Plugin-Fenster bleibt weiss/leer

- Oeffne `https://wordai.hekanet.de` direkt im Browser, um zu pruefen, ob der Server erreichbar ist
- Falls nicht erreichbar: wende dich an den Administrator
- Falls erreichbar: loesche den Add-In-Cache (siehe oben) und starte Word neu

---

## Wie funktioniert das Plugin technisch?

```
Dein PC (Word)                         Server
+------------------+                 +------------------------+
|  Word Dokument   |                 |  wordai.hekanet.de     |
|                  |  laedt UI       |  (Plugin-Oberflaeche)  |
|  [GPT Plus] -----+---------------->|  HTML, CSS, JavaScript |
|  Seitenbereich   |                 +------------------------+
|                  |
|  Plugin-Code ----+----- API ------>  chat.bhk-x.de
|                  |  (Nachrichten,   (Open WebUI + Mistral AI)
+------------------+   Modelle)
```

- **wordai.hekanet.de** liefert die Plugin-Oberflaeche (das, was du in Word siehst)
- **chat.bhk-x.de** ist das KI-Backend, das die Nachrichten verarbeitet (gleiche Plattform wie der Chat im Browser)
- Deine Einstellungen werden lokal in Word gespeichert, nicht auf dem Server
