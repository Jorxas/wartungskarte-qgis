# Kommunale Wartungskarte

Stand: 3. November 2026 — **P11-T01 abgeschlossen; P11-T02 wegen fehlendem QGIS-Zugang blockiert; Fachfunktionen noch umzusetzen**. Geplanter Abschluss der Basis: 2026-11-08, spätestens 8. November 2026. Geschätzter Basisaufwand: 2 Stunden ohne Einrichtung und Erweiterungen.

Eine kleine Gemeinde möchte Wartungsaufträge verorten und offene Aufträge je Bezirk zählen.

Ergebnis: Zwölf synthetische Punkte, eine QGIS-Karte und eine Liste ungültiger Daten.

Vorgesehene Technologien: GIS, GeoJSON, QGIS, Datenqualität. Eine Nennung ist kein Nachweis einer Umsetzung.

## Einstieg

1. [Lastenheft](LASTENHEFT.md) lesen.
2. [Erstes Ticket](tickets/P11-T01.md) öffnen.
3. [Technischen Einstieg](START.md) prüfen und ein Ticket nach dem anderen bearbeiten.
4. [Arbeitsjournal](ARBEITSJOURNAL.md) und echte Nachweise aktualisieren.

Abhängigkeiten: keine weiteren Projekte.

## Datenmodell und Koordinaten — P11-T01

[auftraege.geojson](beispieldaten/auftraege.geojson) enthält eine `FeatureCollection` mit zwölf `Feature`-Einträgen und jeweils einer `Point`-Geometrie. Alle Aufträge, Kennungen und Bezirkszuordnungen sind vollständig synthetisch; es werden keine tatsächlichen Wartungsorte behauptet.

| Feld unter `properties` | Typ und Bedeutung | Vorhandene Werte |
|---|---|---|
| `kennung` | Zeichenkette, eindeutiger Auftrag | G1 bis G12 |
| `zustand` | Zeichenkette, Bearbeitungszustand | `offen`, `erledigt` |
| `bezirk` | Zeichenkette, synthetische Zuordnung | `nord`, `sued` |
| `synthetisch` | Wahrheitswert, Herkunftskennzeichnung | immer `true` |

Die Koordinaten werden als WGS 84 in Dezimalgrad (Projektbezug EPSG:4326) interpretiert. GeoJSON verwendet unter `geometry.coordinates` die Reihenfolge **[Längengrad, Breitengrad]**; sie darf nicht aus der formalen EPSG-Achsenreihenfolge abgeleitet oder vertauscht werden. Die Datei enthält kein eigenes `crs`-Feld. Der lokale Check prüft endliche Zahlen, Längengrade von −180 bis 180 und Breitengrade von −90 bis 90, jeweils einschließlich der Grenzen. Das belegt Wertebereiche, keine tatsächliche Lage in einer Gemeinde und keine Ausführung in QGIS.

| Kennung | Zustand | Bezirk | Längengrad | Breitengrad |
|---|---|---|---:|---:|
| G1 | erledigt | nord | 8.650 | 50.580 |
| G2 | offen | nord | 8.653 | 50.581 |
| G3 | offen | nord | 8.656 | 50.582 |
| G4 | erledigt | nord | 8.659 | 50.583 |
| G5 | offen | nord | 8.662 | 50.584 |
| G6 | offen | nord | 8.665 | 50.585 |
| G7 | erledigt | sued | 8.668 | 50.586 |
| G8 | offen | sued | 8.671 | 50.587 |
| G9 | offen | sued | 8.674 | 50.588 |
| G10 | erledigt | sued | 8.677 | 50.589 |
| G11 | offen | sued | 8.680 | 50.590 |
| G12 | offen | sued | 8.670 | **95 (ungültig)** |

Die Tabelle rundet gültige Koordinaten auf drei Nachkommastellen; die Eingabedatei bleibt einschließlich vorhandener Gleitkommadarstellungen unverändert. G12 ist der absichtliche Fehlerfall: 95 überschreitet den maximalen Breitengrad 90. Er bleibt als zwölfter Eintrag erhalten. Elf Punkte liegen innerhalb der geprüften Wertebereiche.

Der kleine [Bestandscheck](nachweise/p11-t01_pruefen.py) prüft Struktur, Felder, Kennungen, Werte und den erwarteten Fehlerfall. Aufruf und tatsächliches Ergebnis stehen in [START.md](START.md) und [nachweise/p11-t01_ergebnis.json](nachweise/p11-t01_ergebnis.json). Eine fertige Karte, ein QGIS-Projekt und die übergreifende Abnahme A1–A4 bleiben offen.

[Erweiterungen](VARIANTEN.md) haben einen eigenen Umsetzungsstand. [Private Unternehmenszuordnung](UNTERNEHMEN.lokal.md) bleibt außerhalb der Git-Verwaltung.

## P11-T02 — Voraussetzung fehlt

Am 3. November 2026 wurde QGIS im Suchpfad, in den geprüften Standardinstallationsordnern, Windows-Installationsregistrierungen und Startmenüs nicht gefunden; auch kein laufender QGIS-Prozess. Der begrenzte Suchumfang und die tatsächlichen Ergebnisse stehen in [nachweise/p11-t02_voraussetzungen.json](nachweise/p11-t02_voraussetzungen.json). Das ist keine vollständige Laufwerksinventur.

Das Laden der GeoJSON-Datei, die Auswahl von EPSG:4326 und das Finden von G12 in QGIS bleiben ungeprüft. Die zwölf synthetischen Einträge sind unverändert erhalten. P11-T02 bleibt bis zu einem zugänglichen QGIS Desktop blockiert; Lastenheft A1–A4 bleiben offen. Es wurde keine Ersatzsimulation erstellt und keine Folgephase begonnen.

## Projektsprache

Dokumentation, selbst gewählte Bezeichner, Kommentare, Meldungen und Beispieldaten werden auf Deutsch geschrieben. Festgelegte API-Schlüssel, Sprachsyntax und Produktnamen bleiben unverändert.

## QGIS-Import vom 17. November 2026

P11-T02 jetzt tatsächlich geprüft mit installiertem QGIS LTR 3.44.15. Die frühere Installationsblockade ist behoben. Originaldatei über Datenquellenverwaltung / Vektor in QGIS Desktop geladen. Attributtabelle zeigt zwölf Objekte; Projektbezug EPSG:4326 sichtbar. Ausdruck `y($geometry) > 90` wählt genau ein Objekt. „Auswahl nach oben“ zeigt G12, offen, sued, synthetisch=true. Fenster auf dem zweiten Bildschirm.

Der zusätzliche echte QGIS-OGR-Lauf bestätigt Layer- und Projektbezug EPSG:4326, zwölf Objekte und G12 mit Längengrad 8,67 / Breitengrad 95. Breitengrad 95 ist außerhalb [-90, 90]. Originaldatei unverändert, SHA256 `a7e72120289bf7869c408ab9ccd5f7076b9a44ff4b065e8903fd54467e6de9a5`.

[Desktopbeobachtung](nachweise/P11-T02-desktop-2026-11-17.json), [echte Aufnahme](nachweise/P11-T02-desktop-2026-11-17.png), [QGIS-Providerprüfung](nachweise/P11-T02-qgis-pruefung.json). Für die Wiederholung in PowerShell:

~~~powershell
$env:QT_QPA_PLATFORM='offscreen'
& "$env:LOCALAPPDATA/Programs/OSGeo4W/bin/python-qgis-ltr.bat" -X utf8 nachweise/P11-T02-qgis-pruefung.py
~~~

Der Providerlauf ersetzt die Desktopbedienung nicht; beide getrennten Nachweise liegen vor. Zustandsdarstellung, Ausschluss, Legende und fertiges Projekt folgen in T03/T04. Keine realen Wartungsorte und keine Prüfung gegen Gemeindegrenzen behauptet.

## Darstellung und Auswertung vom 17. November 2026

P11-T03 lokal geprüft. `src/geojson_pruefen.py` erhält alle zwölf Originalpunkte und schreibt getrennt elf gültige Punkte sowie den begründeten Fehler G12. Grenzwerte sind inklusive; boolesche, nicht endliche und außerhalb liegende Koordinaten werden abgewiesen. Synthetische Herkunft, Zustand und eindeutige Kennung werden geprüft. Bezirke sind synthetische Attribute, keine überprüften Verwaltungsgrenzen.

Tatsächliche Ergebnisse: [gültige Punkte](karten/gueltige-auftraege.geojson), [Ablehnungsgrund](karten/abgelehnte.json), [offene Aufträge je Bezirk](karten/offene-je-bezirk.json): nord=4, sued=3. G12 wird nicht mitgezählt. QGIS verwendet blaue Kreise für offene und grüne Quadrate für erledigte Aufträge. Elf Kennungen sichtbar; kein Hintergrundkartendienst und keine realen Wartungsorte.

Ausführen: `uv run --offline --python 3.12 python -X utf8 nachweise/P11-T03-pruefung.py`; danach mit der installierten QGIS-Python-Laufzeit `python-qgis-ltr.bat -X utf8 src/karte_erstellen.py`, bei fensterlosem Lauf `QT_QPA_PLATFORM=offscreen`. Beide Befehle erfolgreich. [Echte QGIS-Vorschau](nachweise/P11-T03-kartenvorschau.png) visuell geprüft. Der erste Offscreen-Lauf zeigte Kästchen statt Schriftzeichen; explizites Laden der vorhandenen Arial-Schrift behebt dies, erneuter Renderlauf geprüft. Für andere Systeme muss eine passende Schrift verfügbar sein.

T04 folgt nach Sicherung: echte Projektdatei, Legende, erneutes Öffnen und Bildschirmnachweis. Noch keine Gesamtabnahme behauptet. Studentische Schätzung 45 Minuten; keine separat gemessene Wiederaufnahmedauer, keine menschliche Eigenleistung. Dokumentationszeit: 2026-11-17T17:46:17.755Z.
