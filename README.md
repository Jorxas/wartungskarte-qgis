# Kommunale Wartungskarte

Stand: 1. November 2026 — **P11-T01: Datenmodell beschrieben und lokal geprüft; Fachfunktionen noch umzusetzen**. Geplanter Abschluss der Basis: 2026-11-08, spätestens 8. November 2026. Geschätzter Basisaufwand: 2 Stunden ohne Einrichtung und Erweiterungen.

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

## Projektsprache

Dokumentation, selbst gewählte Bezeichner, Kommentare, Meldungen und Beispieldaten werden auf Deutsch geschrieben. Festgelegte API-Schlüssel, Sprachsyntax und Produktnamen bleiben unverändert.
