"""Kleiner Bestandscheck für P11-T01, keine fertige Fachfunktion."""

import hashlib
import json
import math
import sys
from datetime import datetime
from pathlib import Path


def verlangen(bedingung, meldung):
    if not bedingung:
        raise SystemExit(f"Prüfung fehlgeschlagen: {meldung}")


projektordner = Path(__file__).resolve().parents[1]
datei = projektordner / "beispieldaten" / "auftraege.geojson"
inhalt = datei.read_bytes()
daten = json.loads(inhalt.decode("utf-8"))
verlangen(daten.get("type") == "FeatureCollection", "FeatureCollection erwartet")
punkte = daten.get("features")
verlangen(isinstance(punkte, list) and len(punkte) == 12, "Zwölf Einträge erwartet")
kennungen = set()
ungueltige_punkte = []

for punkt in punkte:
    verlangen(punkt.get("type") == "Feature", "Feature erwartet")
    eigenschaften = punkt.get("properties")
    verlangen(isinstance(eigenschaften, dict), "Eigenschaften fehlen")
    verlangen(set(eigenschaften) == {"kennung", "zustand", "bezirk", "synthetisch"},
              "Unerwartete fachliche Felder")
    kennung = eigenschaften["kennung"]
    verlangen(isinstance(kennung, str) and kennung not in kennungen, "Kennung nicht eindeutig")
    kennungen.add(kennung)
    verlangen(eigenschaften["zustand"] in {"offen", "erledigt"}, "Unbekannter Zustand")
    verlangen(eigenschaften["bezirk"] in {"nord", "sued"}, "Unbekannter Bezirk")
    verlangen(eigenschaften["synthetisch"] is True, "Synthetische Herkunft fehlt")
    geometrie = punkt.get("geometry")
    verlangen(isinstance(geometrie, dict) and geometrie.get("type") == "Point", "Point erwartet")
    koordinaten = geometrie.get("coordinates")
    verlangen(isinstance(koordinaten, list) and len(koordinaten) == 2, "Zwei Koordinaten erwartet")
    verlangen(all(type(wert) in (int, float) and math.isfinite(wert) for wert in koordinaten),
              "Endliche numerische Koordinaten erwartet")
    laengengrad, breitengrad = koordinaten
    gruende = []
    if not -180 <= laengengrad <= 180:
        gruende.append("Längengrad außerhalb [-180, 180]")
    if not -90 <= breitengrad <= 90:
        gruende.append("Breitengrad außerhalb [-90, 90]")
    if gruende:
        ungueltige_punkte.append({"kennung": kennung, "koordinaten": koordinaten, "gruende": gruende})

verlangen(kennungen == {f"G{nummer}" for nummer in range(1, 13)}, "G1 bis G12 erwartet")
verlangen(ungueltige_punkte == [{"kennung": "G12", "koordinaten": [8.67, 95],
                               "gruende": ["Breitengrad außerhalb [-90, 90]"]}],
          "Genau den vorhandenen Fehlerfall G12 erwartet")
verlangen(datei.read_bytes() == inhalt, "Eingabe wurde während der Prüfung verändert")
bericht = {
    "zeitpunkt": datetime.now().astimezone().isoformat(timespec="seconds"),
    "befehl": "uv run --offline --python 3.12 python -X utf8 nachweise/p11-t01_pruefen.py",
    "python_version": sys.version.split()[0],
    "eingabe": "beispieldaten/auftraege.geojson",
    "eingabe_sha256": hashlib.sha256(inhalt).hexdigest(),
    "struktur": "FeatureCollection mit zwölf eindeutigen Point-Features; Felder und Werte geprüft",
    "anzahl": len(punkte),
    "innerhalb_koordinatenbereiche": len(punkte) - len(ungueltige_punkte),
    "ungueltige_punkte": ungueltige_punkte,
    "ergebnis": "Bestandscheck bestanden: erwarteter Fehlerfall erkannt; Eingabe unverändert",
    "grenze": "Keine Ortsprüfung, kein QGIS-Lauf und kein Ausschluss aus einer Karte."
}
ausgabe = json.dumps(bericht, ensure_ascii=False, indent=2) + "\n"
(projektordner / "nachweise" / "p11-t01_ergebnis.json").write_text(ausgabe, encoding="utf-8")
print(ausgabe, end="")
