# 📚 LeseAbenteuer – Lesen lernen für die 2. Klasse

Eine kindgerechte, **offline lauffähige Web-App** (reines HTML/CSS/JavaScript), die Grundschulkindern (ca. 7–9 Jahre) spielerisch beim **Lesen, Leseverständnis und Rechtschreiben** hilft. Alles ist in eine Schatzsuche-Geschichte mit Münzen, Sternen, Welten und Sammelstücken verpackt.

> Läuft komplett im Browser – **ohne Internet, ohne Installation, ohne Konto**. Einfach `index.html` öffnen (ideal auf dem iPad in Hoch- und Querformat).

---

## ✨ Highlights

- **5 Welten, 15 Geschichten, 35 Abschnitte** mit über 60 interaktiven Aufgaben.
- **Alle Auswahlaufgaben als große Tipp-Buttons** mit 4–6 Antwortmöglichkeiten – kein Tippen auf der Tastatur nötig.
- **Ein einziger, kindgerechter Modus**: Geschichten starten direkt, mit angenehmem Zeitpolster und 3 Zeit-Jokern.
- **Adaptive Schwierigkeit**: leichtere Textvarianten und Hinweise erscheinen automatisch, wenn es schwieriger wird.
- **Vorlesen** (Sprachausgabe) ist jederzeit verfügbar, dazu **Wortschatz-Karten** und **Nacherzählen** für dialogisches Lesen.
- **Gamification**: Münzen, Sterne, Level, Streaks, Tages-Missionen, Wochenziel, Sammelstücke und freischaltbare Welten.
- **Lieblingsfigur Wali** 🐋 (der Kuschelwal) und der Metalldetektor **„Pieper"** 🔍 begleiten dosiert durch die Geschichten.
- **Eltern-Bereich** mit erweitertem Lern-Report (Leseverständnis, Rechtschreibung, Wortschatz, Lesezeit, Fokus-Tipp).
- **„Entdecken"-Bereich** mit 14 echten Wissens-Fakten.
- **Barrierearm**: Hell/Dunkel-Modus, legasthenie-freundlicher Modus, große gut lesbare Schrift.
- **Mehrsprachig & modular**: Deutsch (Standard) und Englisch, am Start wählbar; Inhalte und Texte sauber getrennt.
- **Fortschritt** wird lokal im Browser gespeichert (`localStorage`).

---

## 🚀 Schnellstart

**Variante A – einfach benutzen:**
Die Datei `index.html` herunterladen und im Browser öffnen. Fertig.

**Variante B – online stellen (GitHub Pages):**
1. In den Repository-Einstellungen *Settings → Pages* öffnen.
2. Unter *Build and deployment* die Quelle **„Deploy from a branch"** wählen.
3. Branch **`main`** und Ordner **`/ (root)`** auswählen, speichern.
4. Nach kurzer Zeit ist die App unter `https://allessuper.github.io/reading-treasure-quest/` erreichbar.

---

## 🛠️ Aufbau & Build

Der Quellcode liegt aus Übersichtsgründen aufgeteilt im Ordner `src/`:

| Datei | Inhalt |
|---|---|
| `src/styles.css` | Gesamtes Design (Themes, Layout, Buttons, Animationen) |
| `src/shell.html` | HTML-Grundgerüst (Screens & Overlays) |
| `src/content.js` | Alle Inhalte: Welten, Geschichten, Aufgaben, Texte (de/en) |
| `src/app.js` | Spiel-Logik, Fortschritt, Belohnungen, Eltern-Report |
| `build.sh` | Bündelt `src/*` zu einer eigenständigen `index.html` |
| `index.html` | Fertig gebündelte, direkt benutzbare App |

Nach Änderungen am Quellcode neu bündeln:

```bash
bash build.sh
```

Dadurch wird `index.html` neu erzeugt.

---

## 🧩 Erweitern

Neue Geschichten oder Aufgaben lassen sich in `src/content.js` ergänzen (Struktur: `CONTENT.worlds` → Story → `sections` → `tasks`). Unterstützte Aufgabentypen u. a.: `quiz`, `predict`, `vocab`, `missing`, `syllable`, `wordimage`, `sentence`, `spellfix`, `retell` und der Detektor-Minispiel-Typ `detector`. Anschließend `bash build.sh` ausführen.

---

## 👫 Figuren

Wiederkehrende Freunde in den Geschichten: **Gusti, Dana, Hannah, Luki, Marie, Anton, Vincent, Lotti** – und natürlich **Wali**, der Kuschelwal. Auf Spurensuche hilft der Metalldetektor **„Pieper"**.

---

## 📄 Lizenz

Privates Lernprojekt. Frei für den persönlichen und schulischen Gebrauch.
