# Technischer Einstieg — P11

## P11-T01 lokal nachvollziehen

Im Projektordner in PowerShell ausführen; benötigt wird nur die vorhandene Python-Laufzeit mit Standardbibliothek:

~~~powershell
uv run --offline --python 3.12 python -X utf8 nachweise/p11-t01_pruefen.py
~~~

Der Bestandscheck liest `beispieldaten/auftraege.geojson`, verändert die Datei nicht und schreibt `nachweise/p11-t01_ergebnis.json`. Beim erneuten Aufruf wird dieser Bericht mit aktuellem Zeitpunkt ersetzt. Die genaue Python-Version steht im Bericht.

Erwartet: zwölf Point-Features, vollständige fachliche Felder, eindeutige Kennungen G1 bis G12 und synthetische Herkunft. Elf Koordinatenpaare liegen im Wertebereich; G12 mit `[8.67, 95]` verletzt die Breitengradgrenze. Rückgabecode 0 bedeutet hier, dass der bekannte Fehlerfall wie erwartet erkannt wurde. Abweichungen vom beschriebenen Bestand führen zu einem Fehler und einem Rückgabecode ungleich 0.

Das Datenmodell und alle zwölf Einträge sind in [README.md](README.md) beschrieben. Der Bericht enthält den SHA-256 der Eingabe, die Python-Version, den Prüfzeitpunkt und die Begründung für G12. Dies ist ein kleiner Nachweis für P11-T01, keine allgemeine GeoJSON-Validierung.

## Vorhandener Einstiegspunkt und spätere Arbeit

~~~powershell
uv run --offline --python 3.12 python -X utf8 src/geojson_pruefen.py
~~~

Der vorhandene Einstiegspunkt meldet weiterhin nur den Initialisierungsstand; seine Fachfunktion ist nicht implementiert. Er ist kein Abnahmenachweis. In P11-T01 wurden weder QGIS ausgeführt noch eine Karte oder eine Projektdatei erstellt.

## P11-T02 — blockiert am 3. November 2026

QGIS Desktop ist eine tatsächliche Voraussetzung. Die lokale Zugangssuche fand keinen QGIS-Befehl, passenden Installationsordner oder Installationseintrag, keine Startmenüverknüpfung und keinen laufenden QGIS-Prozess. Suchumfang und Ergebnis: `nachweise/p11-t02_voraussetzungen.json`; ausgeführte Prüfungen: `nachweise/p11-t02_abschluss.txt`.

Erst mit zugänglichem QGIS Desktop lässt sich der ausstehende Ablauf prüfen: `beispieldaten/auftraege.geojson` laden, Layer- und Projektbezug WGS 84 / EPSG:4326 prüfen beziehungsweise auswählen und G12 mit dem Breitengrad 95 auffinden und begründen. Dabei alle zwölf Eingabeeinträge erhalten. Dieser Ablauf wurde nicht ausgeführt. Zustandsdarstellung, Legende, Ausschluss und fertige Karte gehören nicht zum freigegebenen Endpunkt dieser Phase. Ein Python-Ergebnis ersetzt die QGIS-Abnahme nicht.

## QGIS-Import vom 17. November 2026

P11-T02 jetzt tatsächlich geprüft mit installiertem QGIS LTR 3.44.15. Die frühere Installationsblockade ist behoben. Originaldatei über Datenquellenverwaltung / Vektor in QGIS Desktop geladen. Attributtabelle zeigt zwölf Objekte; Projektbezug EPSG:4326 sichtbar. Ausdruck `y($geometry) > 90` wählt genau ein Objekt. „Auswahl nach oben“ zeigt G12, offen, sued, synthetisch=true. Fenster auf dem zweiten Bildschirm.

Der zusätzliche echte QGIS-OGR-Lauf bestätigt Layer- und Projektbezug EPSG:4326, zwölf Objekte und G12 mit Längengrad 8,67 / Breitengrad 95. Breitengrad 95 ist außerhalb [-90, 90]. Originaldatei unverändert, SHA256 `a7e72120289bf7869c408ab9ccd5f7076b9a44ff4b065e8903fd54467e6de9a5`.

[Desktopbeobachtung](nachweise/P11-T02-desktop-2026-11-17.json), [echte Aufnahme](nachweise/P11-T02-desktop-2026-11-17.png), [QGIS-Providerprüfung](nachweise/P11-T02-qgis-pruefung.json). Für die Wiederholung in PowerShell:

~~~powershell
$env:QT_QPA_PLATFORM='offscreen'
& "$env:LOCALAPPDATA/Programs/OSGeo4W/bin/python-qgis-ltr.bat" -X utf8 nachweise/P11-T02-qgis-pruefung.py
~~~

Der Providerlauf ersetzt die Desktopbedienung nicht; beide getrennten Nachweise liegen vor. Zustandsdarstellung, Ausschluss, Legende und fertiges Projekt folgen in T03/T04. Keine realen Wartungsorte und keine Prüfung gegen Gemeindegrenzen behauptet.
