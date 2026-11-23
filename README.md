# Wartungsaufträge in QGIS kartieren

Wartungsaufträge einer fiktiven Gemeinde sollen nach Bezirk verortet werden; ungültige Koordinaten dürfen die Karte nicht verfälschen.

![Projektaufbau](dokumentation/ueberblick.svg)

**Veröffentlichungsstand: Phase 4/4.** Dieses eigenständige Repository übernimmt zunächst den bereits lokal committeten Stand. Weitere fachliche Phasen werden im Abstand von mindestens vier Stunden veröffentlicht. Die technische Entwicklung und die öffentliche Veröffentlichung haben unterschiedliche echte Zeitpunkte.

## Was hier zu sehen ist

| Schritt | Inhalt | Hier veröffentlicht |
|---|---|---|
| 1 | GeoJSON und Koordinatenvertrag | Ja |
| 2 | QGIS-Projekt und gültige Punkte | Ja |
| 3 | Kartengestaltung und Auswertung | Ja |
| 4 | Portables QGZ und Layoutprüfung | Ja |

## Fachlicher Nutzen

Geodatenqualität, EPSG:4326, Kartenaufbereitung und portable GIS-Projekte.

## Lokal starten

Im geklonten Repository ausführen; die benötigte Laufzeit muss installiert sein. Python-Beispiele verwenden 3.12, Node-Beispiele 24 und C# die im Projekt angegebene .NET-Version. Befehle mit uv laden die dort genau bezeichneten Pakete bei Bedarf.

```powershell
python -X utf8 nachweise/p11-t01_pruefen.py
```

Ausführliche technische Befehle: [START.md](START.md). [Öffentlicher Prüfstand](ABNAHME.json) und [Quellphasen](VERLAUF.json) dokumentieren Herkunft und echte Ausführungsdaten. Eine neue Repositorykopie ist kein neuer nativer Desktoplauf.

## Demo

Live: <https://jorxas.github.io/wartungskarte-qgis/> (Deutsch, mit Umschalter auf Französisch; `?lang=fr`).

Die Demo zeigt einen Anwendungsfall: zwölf Wartungsaufträge, eine ungültige Koordinate (G12). Koordinaten lassen sich im Browser ändern; die Prüfung entscheidet sofort, welche Punkte auf die Karte kommen und wie viele offene Aufträge je Bezirk bleiben. Dazu stehen echte Ausgaben der Projektskripte und der aus QGIS exportierte Drucklayout (Python 3.13, QGIS 3.44 offscreen).

- Die Prüflogik aus `src/geojson_pruefen.py` läuft im Browser als JavaScript-Nachbau (`demo/pruefung.js`). `tools/browser-pruefen.cjs` vergleicht ihn auf 149 Fällen mit dem Python-Original.
- Die Karte ist ein gespeicherter Export, kein Live-Rendering. Die Vorschau im Browser ist eine eigene SVG-Zeichnung, kein QGIS.

Neu erzeugen: `python -X utf8 demo/erzeugen.py` (kopiert das Projekt in einen Temporärordner, führt dort die Skripte aus und schreibt `demo/lauf-daten.js`, `demo/wartungskarte-layout.png`, `demo/aequivalenz.json`; QGIS-Schritte brauchen `python-qgis-ltr.bat`, Pfad über `QGIS_PYTHON`). Bauen und prüfen: `node tools/bauen.cjs` und `node tools/browser-pruefen.cjs` (puppeteer-core und Chrome nötig). Veröffentlicht wird der Inhalt von `dist/` auf dem Zweig `gh-pages`.

## Ergebnis des lokal geprüften Schlussstands

11 gültige Punkte; G12 mit Breite 95 ausgeschlossen. Gespeichertes QGIS-Projekt und Layout tatsächlich gelesen.

## Grenzen

Nur synthetische Geodaten; keine kommunale Berufserfahrung.

Eigenes kleines Lernprojekt mit synthetischen Daten, mit KI-Unterstützung entwickelt und geprüft. Keine Aussage über Berufserfahrung, menschliche Arbeitsstunden oder praktische Verwendung weiterer nur geplanter Produkte.

## Entwicklungshistorie

[Entwicklungshistorie](HISTORIE.md): die vorhandenen lokalen Änderungen, ihre ursprünglichen Daten und die spätere GitHub-Übernahme.
