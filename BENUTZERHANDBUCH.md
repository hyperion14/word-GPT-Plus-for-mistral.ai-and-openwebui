# Benutzerhandbuch - Word GPT Plus v2.0.1

## Inhaltsverzeichnis

1. [Ueberblick](#1-ueberblick)
2. [Die Oberflaeche](#2-die-oberflaeche)
3. [Nachrichten senden](#3-nachrichten-senden)
4. [Schnellaktionen](#4-schnellaktionen)
5. [Antworten in das Dokument einfuegen](#5-antworten-in-das-dokument-einfuegen)
6. [Agent-Modus (Werkzeuge)](#6-agent-modus-werkzeuge)
7. [Eigene Prompts verwalten](#7-eigene-prompts-verwalten)
8. [Einstellungen](#8-einstellungen)
9. [Verfuegbare Modelle](#9-verfuegbare-modelle)
10. [Tipps und Tricks](#10-tipps-und-tricks)
11. [Fehlerbehebung](#11-fehlerbehebung)

---

## 1. Ueberblick

Word GPT Plus bringt kuenstliche Intelligenz direkt in Microsoft Word. Du kannst Fragen stellen, Texte uebersetzen, zusammenfassen, verbessern lassen und die KI-Antworten direkt in dein Dokument einfuegen - alles ohne Word zu verlassen.

### Was kann das Plugin?

- **Chat mit KI** - Stelle Fragen, lasse Texte schreiben oder bearbeiten
- **Schnellaktionen** - Uebersetzen, Zusammenfassen, Grammatik pruefen mit einem Klick
- **Dokumentzugriff** - Die KI kann deinen markierten Text lesen und verarbeiten
- **Direkt einfuegen** - Antworten per Klick ins Dokument uebernehmen
- **Agent-Modus** - Die KI kann selbststaendig mit deinem Dokument arbeiten (Tabellen erstellen, Text formatieren, suchen und ersetzen, etc.)

---

## 2. Die Oberflaeche

So sieht das Plugin-Fenster aus, wenn du es oeffnest:

```
+--------------------------------------+
|  Word GPT+              [+] [Zahnrad]|  Kopfzeile
+--------------------------------------+
|  [Ueb.] [Pol.] [Akad.] [Zus.] [Gram]|  Schnellaktionen
|  [Prompt-Auswahl v]                  |  Gespeicherte Prompts
+--------------------------------------+
|                                      |
|  Du: Wie formuliere ich...           |  Chat-Verlauf
|                                      |
|  KI: Sie koennten es so...           |
|      [Ersetzen] [Anfuegen] [Kopieren]|  Aktionen pro Antwort
|                                      |
+--------------------------------------+
|  [Fragen] [Agent] | [Provider] [Modell]| Modus + Auswahl
+--------------------------------------+
|  [Nachricht eingeben...       ] [>]  |  Eingabefeld
|  [x] Markierten Text einbeziehen     |  Optionen
|  [x] Word-Formatierung verwenden     |
+--------------------------------------+
```

### Elemente erklaert

| Element | Funktion |
|---------|----------|
| **[+]** (oben rechts) | Neuen Chat starten, Verlauf loeschen |
| **Zahnrad** (oben rechts) | Einstellungen oeffnen |
| **Schnellaktionen** | Ein-Klick-Aktionen fuer markierten Text |
| **Prompt-Auswahl** | Gespeicherte Prompt-Vorlagen waehlen |
| **Chat-Verlauf** | Alle Nachrichten der aktuellen Sitzung |
| **[Fragen] / [Agent]** | Wechsel zwischen einfachem Chat und Agent-Modus |
| **Provider / Modell** | KI-Anbieter und Modell auswaehlen |
| **Eingabefeld** | Hier gibst du deine Nachricht ein |

---

## 3. Nachrichten senden

### Einfache Frage stellen

1. Tippe deine Frage ins Eingabefeld unten ein
2. Druecke **Enter** oder klicke den **Senden**-Button
3. Die Antwort erscheint in Echtzeit im Chat-Verlauf

### Text aus dem Dokument einbeziehen

1. Markiere einen Text in deinem Word-Dokument
2. Stelle sicher, dass **"Markierten Text einbeziehen"** aktiviert ist (Haekchen unten)
3. Stelle deine Frage - der markierte Text wird automatisch mitgeschickt

**Beispiel:**
- Du markierst einen Absatz in deinem Vertrag
- Du tippst: *"Erklaere diesen Paragraphen in einfacher Sprache"*
- Die KI erhaelt sowohl deine Frage als auch den markierten Text

### Mehrzeilige Eingabe

- **Enter** = Nachricht senden
- **Shift + Enter** = Neue Zeile im Eingabefeld (ohne zu senden)

---

## 4. Schnellaktionen

Schnellaktionen sind vordefinierte Befehle, die du mit einem Klick auf markierten Text anwenden kannst.

### So funktioniert es:

1. **Markiere** den gewuenschten Text im Word-Dokument
2. **Klicke** auf eine der Schnellaktions-Buttons im Plugin

### Verfuegbare Schnellaktionen

| Button | Aktion | Beschreibung |
|--------|--------|-------------|
| **Ueb.** | Uebersetzen | Uebersetzt den markierten Text in die eingestellte Zielsprache |
| **Pol.** | Polieren | Verbessert Stil, Wortwahl und Lesefluss |
| **Akad.** | Akademisch | Schreibt den Text in wissenschaftlichem Stil um |
| **Zus.** | Zusammenfassen | Erstellt eine knappe Zusammenfassung |
| **Gram.** | Grammatik | Korrigiert Rechtschreibung und Grammatikfehler |

### Beispiel: Text uebersetzen

1. Markiere einen deutschen Absatz in deinem Dokument
2. Klicke auf **Ueb.** (Uebersetzen)
3. Die KI liefert die Uebersetzung im Chat
4. Klicke auf **Ersetzen**, um den Originaltext durch die Uebersetzung auszutauschen

---

## 5. Antworten in das Dokument einfuegen

Jede KI-Antwort hat drei Buttons:

| Button | Aktion | Was passiert |
|--------|--------|-------------|
| **Ersetzen** | Markierten Text ersetzen | Der aktuell im Dokument markierte Text wird durch die KI-Antwort ersetzt |
| **Anfuegen** | Text anfuegen | Die KI-Antwort wird nach der aktuellen Markierung eingefuegt |
| **Kopieren** | In Zwischenablage | Die Antwort wird in die Zwischenablage kopiert |

### Word-Formatierung

Wenn **"Word-Formatierung verwenden"** aktiviert ist:
- Fettschrift, Aufzaehlungen und Ueberschriften werden als Word-Formatierung eingefuegt
- Deaktiviere diese Option, wenn du reinen Text ohne Formatierung einfuegen moechtest

---

## 6. Agent-Modus (Werkzeuge)

### Was ist der Agent-Modus?

Im normalen **Fragen**-Modus beantwortet die KI einfach deine Frage. Im **Agent**-Modus kann die KI selbststaendig Werkzeuge benutzen, um mit deinem Word-Dokument zu arbeiten.

### Wechsel zum Agent-Modus

Klicke unten im Plugin auf **Agent** (statt **Fragen**).

### Was kann der Agent?

#### Text-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| Markierten Text lesen | Liest den aktuell markierten Text |
| Gesamtes Dokument lesen | Liest den kompletten Dokumentinhalt |
| Text einfuegen | Fuegt Text an der Cursorposition ein |
| Markierung ersetzen | Ersetzt den markierten Text |
| Text anfuegen | Fuegt Text nach der Markierung ein |
| Text loeschen | Loescht markierten Inhalt |
| Absatz einfuegen | Fuegt einen neuen Absatz ein |

#### Formatierungs-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| Text formatieren | Fett, kursiv, unterstrichen |
| Schriftart aendern | Andere Schriftfamilie setzen |
| Formatierung entfernen | Alle Formatierungen loeschen |

#### Struktur-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| Tabelle einfuegen | Erstellt eine Tabelle |
| Liste einfuegen | Erstellt Aufzaehlungs- oder nummerierte Listen |
| Seitenumbruch einfuegen | Fuegt einen Seitenumbruch ein |
| Bild einfuegen | Fuegt ein Bild von einer URL ein |

#### Such-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| Text suchen | Sucht nach Text im Dokument |
| Suchen und Ersetzen | Findet und ersetzt Text |
| Dokumenteigenschaften | Zeigt Metadaten des Dokuments |

#### Allgemeine Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| Websuche | Sucht im Internet via DuckDuckGo |
| Webseite abrufen | Liest den Text einer Webseite aus |
| Datum/Uhrzeit | Gibt das aktuelle Datum zurueck |
| Taschenrechner | Berechnet mathematische Ausdruecke |

### Beispiel fuer den Agent-Modus

```
Du: "Lies den markierten Text, fasse ihn zusammen und fuege
     die Zusammenfassung als neuen Absatz danach ein."

Agent:
  Werkzeug: Markierten Text lesen... erledigt
  Werkzeug: Absatz einfuegen... erledigt

  Ich habe den markierten Text ueber Vertragsrecht gelesen
  und eine Zusammenfassung danach eingefuegt.
```

### Werkzeuge aktivieren/deaktivieren

1. Gehe in die **Einstellungen** > Tab **Werkzeuge** (Tools)
2. Aktiviere oder deaktiviere einzelne Werkzeuge per Schalter
3. Nur aktivierte Werkzeuge stehen dem Agent zur Verfuegung

### Einschraenkung

Der Agent-Modus funktioniert **nicht** mit dem OpenWebUI-Provider. Falls du den Agent-Modus nutzen moechtest, wechsle auf den **Mistral**-Provider (direkt) oder einen anderen unterstuetzten Provider.

---

## 7. Eigene Prompts verwalten

### Was sind Prompts?

Prompts sind Vorlagen, die der KI Anweisungen geben, wie sie antworten soll. Zum Beispiel:
- *"Du bist ein juristischer Assistent. Antworte immer in formeller Sprache."*
- *"Fasse Texte immer in maximal 3 Saetzen zusammen."*

### Prompt erstellen

1. Gehe in die **Einstellungen** > Tab **Prompts**
2. Klicke auf **Neuen Prompt hinzufuegen**
3. Gib dem Prompt einen Namen (z.B. "Juristischer Assistent")
4. Fuelle die Felder aus:
   - **System-Prompt**: Anweisungen fuer die KI (z.B. Rolle, Stil)
   - **User-Prompt**: Vorlage fuer die Benutzernachricht (optional)
5. Speichere den Prompt

### Prompt verwenden

1. Auf der Startseite: klicke auf das **Prompt-Dropdown** (unter den Schnellaktionen)
2. Waehle deinen gespeicherten Prompt aus
3. Der System-Prompt wird automatisch im Hintergrund gesetzt
4. Tippe deine Nachricht und sende sie - die KI antwortet gemaess den Prompt-Anweisungen

---

## 8. Einstellungen

### Provider-Einstellungen

| Einstellung | Beschreibung | Empfehlung fuer BHK |
|-------------|-------------|---------------------|
| **API Provider** | KI-Anbieter auswaehlen | `openwebui` |
| **Open-WebUI URL** | Adresse der Open WebUI Instanz | `https://chat.bhk-x.de` |
| **Plugin URL** | Adresse des Plugin-Servers | `https://wordai.hekanet.de` |
| **Instance** | Verbindungsmodus | `custom` |
| **JWT Token** | Authentifizierungstoken | Dein persoenlicher Token/API-Key |

### Modell-Einstellungen

| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| **Modell** | Welches KI-Modell verwendet wird | (abhaengig vom Provider) |
| **Temperatur** | Kreativitaet der Antworten (0 = praezise, 2 = kreativ) | 0.7 |
| **Max Tokens** | Maximale Laenge der Antwort | 1024 |

### Allgemeine Einstellungen

| Einstellung | Beschreibung | Standard |
|-------------|-------------|----------|
| **Oberflaechensprache** | Sprache der Plugin-Oberflaeche | Englisch |
| **Antwortsprache** | In welcher Sprache die KI antwortet | Automatisch |

### Wo werden die Einstellungen gespeichert?

Alle Einstellungen werden **lokal in deinem Word** gespeichert (im Browser-Speicher des Add-Ins). Sie werden **nicht** auf den Server uebertragen. Wenn du Word auf einem anderen Computer nutzt, musst du die Einstellungen dort erneut eingeben.

---

## 9. Verfuegbare Modelle

Wenn du mit Open WebUI (BHK) verbunden bist, stehen dir folgende Modelle zur Verfuegung:

### Standard-Modelle (Mistral AI)

| Modell | Beschreibung | Empfehlung |
|--------|-------------|------------|
| `mistral-large-latest` | Grosses Modell, beste Qualitaet | Fuer komplexe Aufgaben |
| `mistral-medium-latest` | Mittleres Modell | Guter Kompromiss |
| `mistral-small-latest` | Kleines Modell, sehr schnell | Fuer einfache Fragen |
| `magistral-medium-latest` | Reasoning-Modell (mittl.) | Fuer logische/analytische Aufgaben |
| `magistral-small-latest` | Reasoning-Modell (klein) | Fuer schnelle Analysen |
| `ministral-14b-latest` | Ministral 14B | Kompakt und schnell |
| `ministral-3b-latest` | Ministral 3B | Am schnellsten |

### BHK-eigene Modelle und Pipelines

| Modell | Beschreibung |
|--------|-------------|
| `aktenknecht` | BHK-Modell mit Dateiupload, Websuche und Quellenangaben |
| `bhk_diktat_pipe.bhk-diktat` | Diktat-Pipeline |
| `bhk_stiltraining_pipe.bhk-stiltraining` | Stiltraining-Pipeline |
| `jur-schreibassisten` | Juristischer Schreibassistent |
| `vergabe` | Spezialist fuer Vergaberecht |

### Modell wechseln

1. Nutze das **Modell-Dropdown** unten im Chat-Fenster
2. Oder gehe in die **Einstellungen** > **Provider** und waehle dort ein Modell
3. Der Wechsel gilt sofort fuer die naechste Nachricht

---

## 10. Tipps und Tricks

### Effektive Nutzung

- **Markiere zuerst, dann frage:** Markiere den relevanten Text im Dokument, bevor du eine Frage stellst. Die KI versteht den Kontext dann besser.
- **Sei konkret:** Statt *"Verbessere den Text"* schreibe *"Formuliere diesen Absatz formeller und kuerze ihn auf die Haelfte"*.
- **Nutze Schnellaktionen:** Fuer Standard-Aufgaben wie Uebersetzen oder Zusammenfassen sind die Schnellaktions-Buttons schneller als eine ausformulierte Frage.
- **Agent fuer mehrstufige Aufgaben:** Wenn die KI mehrere Schritte im Dokument ausfuehren soll (z.B. lesen, verarbeiten, einfuegen), nutze den Agent-Modus.

### Tastenkuerzel

| Taste | Aktion |
|-------|--------|
| **Enter** | Nachricht senden |
| **Shift + Enter** | Neue Zeile im Eingabefeld |

### Neuen Chat starten

Klicke auf **[+]** oben rechts, um:
- Den Chat-Verlauf zu loeschen
- Die Konversation zurueckzusetzen
- Prompt-Auswahl zurueckzusetzen

Das ist nuetzlich, wenn du zu einem neuen Thema wechseln moechtest, da die KI sonst den vorherigen Kontext mitberuecksichtigt.

### Dunkler Modus

Das Plugin unterstuetzt den dunklen Modus automatisch. Es folgt der Systemeinstellung:
- **Windows:** Einstellungen > Personalisierung > Farben > Dunkel
- **Word:** Datei > Konto > Office-Design > Dunkelgrau oder Schwarz

---

## 11. Fehlerbehebung

### "Kein API-Schluessel" Fehler

- Gehe in die **Einstellungen** > **Provider**
- Stelle sicher, dass **openwebui** ausgewaehlt ist
- Pruefe, ob das **JWT Token** Feld ausgefuellt ist
- JWT-Tokens koennen ablaufen - erstelle ggf. einen neuen API-Key

### Modelle werden nicht angezeigt

1. Klicke auf **Aktualisieren** neben dem Modell-Dropdown
2. Stelle Instance auf `custom` und Open-WebUI URL auf `https://chat.bhk-x.de`
3. Pruefe, ob dein Token gueltig ist (teste den Login unter https://chat.bhk-x.de)

### Antwort bricht mittendrin ab

- Lange Antworten koennen durch Timeouts abgebrochen werden
- Stelle **Max Tokens** in den Einstellungen hoeher ein (z.B. 2048 oder 4096)
- Alternativ: bitte die KI, kuerzer zu antworten

### Agent-Modus zeigt Warnung bei OpenWebUI

- Das ist normal - der OpenWebUI-Provider unterstuetzt kein Tool-Calling
- Wechsle zum **Mistral**-Provider (direkt) fuer den Agent-Modus
- Oder nutze den normalen **Fragen**-Modus mit OpenWebUI

### Plugin-Fenster bleibt weiss/leer

1. Pruefe ob `https://wordai.hekanet.de` im Browser erreichbar ist
2. Falls nicht: wende dich an den Administrator
3. Falls ja: loesche den Word Add-In Cache:
   - **Windows:** Loesche `%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\`
   - **Mac:** Loesche `~/Library/Containers/com.microsoft.Word/Data/Documents/wef/`
4. Starte Word neu

### Sicherheitswarnung von Word

Word verlangt, dass Add-Ins ueber HTTPS geladen werden. Das Plugin wird ueber `https://wordai.hekanet.de` bereitgestellt, was ein gueltiges SSL-Zertifikat besitzt. Falls trotzdem eine Warnung erscheint:

1. Pruefe, ob du die richtige Manifest-Datei verwendest (`manifest-docker-3100.xml` mit HTTPS-URLs)
2. Oeffne `https://wordai.hekanet.de` im Browser - es sollte kein Zertifikatsfehler erscheinen
3. Falls ein Zertifikatsfehler im Browser erscheint: wende dich an den Administrator

---

## Anhang: Unterschied Fragen-Modus vs. Agent-Modus

| Eigenschaft | Fragen-Modus | Agent-Modus |
|-------------|-------------|-------------|
| Einfacher Chat | Ja | Ja |
| Werkzeuge nutzen | Nein | Ja |
| Word-Dokument bearbeiten | Nein (nur manuell ueber Buttons) | Ja (automatisch) |
| Websuche | Nein | Ja |
| Geschwindigkeit | Schneller | Langsamer (mehrere Schritte) |
| OpenWebUI-Provider | Ja | Nein |
| Mistral-Provider (direkt) | Ja | Ja |
