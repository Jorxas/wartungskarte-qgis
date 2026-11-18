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

Der vorhandene Einstiegspunkt meldet weiterhin nur den Initialisierungsstand; seine Fachfunktion ist nicht implementiert. Er ist kein Abnahmenachweis. QGIS Desktop wird erst für die nachfolgenden QGIS-Schritte benötigt. In P11-T01 wurden weder QGIS ausgeführt noch eine Karte oder eine Projektdatei erstellt. Die nächste Phase ist P11-T02 und wurde nicht begonnen.
