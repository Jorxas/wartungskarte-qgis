"""Synthetische Wartungspunkte prüfen, Fehler trennen und offene Aufträge zählen."""
import json
import math
from collections import Counter
from pathlib import Path

PROJEKTORDNER = Path(__file__).resolve().parents[1]

def koordinaten_pruefen(daten):
    if daten.get("type") != "FeatureCollection" or not isinstance(daten.get("features"), list):
        raise ValueError("Eine GeoJSON-FeatureCollection ist erforderlich.")
    gueltig, abgelehnt, kennungen = [], [], set()
    for nummer, objekt in enumerate(daten["features"], 1):
        eigenschaften = objekt.get("properties") or {}
        kennung = eigenschaften.get("kennung")
        geometrie = objekt.get("geometry") or {}
        koordinaten = geometrie.get("coordinates")
        grund = None
        if not isinstance(kennung, str) or not kennung or kennung in kennungen:
            grund = "Kennung fehlt oder ist doppelt."
        elif eigenschaften.get("synthetisch") is not True:
            grund = "Nur ausdrücklich synthetische Daten sind erlaubt."
        elif eigenschaften.get("zustand") not in ("offen", "erledigt") or not eigenschaften.get("bezirk"):
            grund = "Zustand oder Bezirk fehlt beziehungsweise ist ungültig."
        elif geometrie.get("type") != "Point" or not isinstance(koordinaten, list) or len(koordinaten) != 2:
            grund = "Genau ein zweidimensionaler Punkt ist erforderlich."
        elif any(type(wert) not in (int, float) or not math.isfinite(wert) for wert in koordinaten):
            grund = "Koordinaten müssen endliche Zahlen sein."
        elif not -180 <= koordinaten[0] <= 180:
            grund = "Längengrad außerhalb [-180, 180]."
        elif not -90 <= koordinaten[1] <= 90:
            grund = "Breitengrad außerhalb [-90, 90]."
        if isinstance(kennung, str):
            kennungen.add(kennung)
        if grund:
            abgelehnt.append({"zeile": nummer, "kennung": kennung, "grund": grund})
        else:
            gueltig.append(objekt)
    offene = Counter(e["properties"]["bezirk"] for e in gueltig if e["properties"]["zustand"] == "offen")
    return {"gueltig": {"type": "FeatureCollection", "features": gueltig},
            "abgelehnt": abgelehnt, "offenJeBezirk": dict(sorted(offene.items()))}


def ausgaben_erstellen():
    daten = json.loads((PROJEKTORDNER / "beispieldaten/auftraege.geojson").read_text(encoding="utf-8-sig"))
    ergebnis = koordinaten_pruefen(daten)
    ziel = PROJEKTORDNER / "karten"
    ziel.mkdir(exist_ok=True)
    for name, inhalt in [("gueltige-auftraege.geojson", ergebnis["gueltig"]),
                         ("abgelehnte.json", ergebnis["abgelehnt"]), ("offene-je-bezirk.json", ergebnis["offenJeBezirk"])]:
        (ziel / name).write_text(json.dumps(inhalt, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    return ergebnis

if __name__ == "__main__":
    ergebnis = ausgaben_erstellen()
    print(json.dumps({"gueltigePunkte": len(ergebnis["gueltig"]["features"]),
                      "abgelehnt": ergebnis["abgelehnt"], "offenJeBezirk": ergebnis["offenJeBezirk"]}, ensure_ascii=False))
