"""Auslassung und Bezirkszahlen aus den Originaldaten nachprüfen."""
import copy
import hashlib
import json
import sys
from pathlib import Path

PROJEKT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJEKT / "src"))
from geojson_pruefen import koordinaten_pruefen, ausgaben_erstellen

original = PROJEKT / "beispieldaten/auftraege.geojson"
assert hashlib.sha256(original.read_bytes()).hexdigest() == "a7e72120289bf7869c408ab9ccd5f7076b9a44ff4b065e8903fd54467e6de9a5"
ergebnis = ausgaben_erstellen()
assert len(ergebnis["gueltig"]["features"]) == 11
assert ergebnis["offenJeBezirk"] == {"nord": 4, "sued": 3}
assert len(ergebnis["abgelehnt"]) == 1 and ergebnis["abgelehnt"][0]["kennung"] == "G12"
assert "Breitengrad" in ergebnis["abgelehnt"][0]["grund"]
assert all(e["properties"]["kennung"] != "G12" for e in ergebnis["gueltig"]["features"])
punkt = ergebnis["gueltig"]["features"][0]
for koordinaten, erwartet in [([-180, -90], True), ([180, 90], True), ([180.1, 0], False),
                               ([0, 90.1], False), ([True, 0], False), ([float("nan"), 0], False)]:
    fall = copy.deepcopy(punkt)
    fall["geometry"]["coordinates"] = koordinaten
    auswertung = koordinaten_pruefen({"type": "FeatureCollection", "features": [fall]})
    assert bool(auswertung["gueltig"]["features"]) == erwartet
print("BESTANDEN: Original unverändert, elf gültige Punkte, G12 begründet ausgeschlossen; nord=4, sued=3; echte Grenzfälle geprüft.")
