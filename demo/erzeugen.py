"""Erzeugt die Daten der Demo aus echten Läufen des Projekts.

Aufruf im Projektordner:  python -X utf8 demo/erzeugen.py

Der Projektstand wird zuerst in einen Temporärordner kopiert; die Skripte des Projekts
laufen nur dort. Dadurch bleiben Eingabedaten und abgeleitete Dateien des Repositorys unverändert.
Gelaufen wird mit der installierten Python-Version und, falls vorhanden, mit QGIS (python-qgis-ltr.bat,
Umgebungsvariable QGIS_PYTHON überschreibt den Pfad). Ohne QGIS werden die QGIS-Schritte
ausdrücklich als nicht ausgeführt markiert.

Geschrieben werden:
  demo/lauf-daten.js              echte Ausgaben und die zwölf Eingabepunkte
  demo/wartungskarte-layout.png   Layout-Export aus QGIS (nur mit QGIS)
  demo/aequivalenz.json           Prüffälle mit Ergebnissen der Python-Prüflogik (Vergleich mit dem JS-Nachbau)
"""
import json
import os
import platform
import random
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

PROJEKT = Path(__file__).resolve().parents[1]
DEMO = PROJEKT / "demo"
sys.path.insert(0, str(PROJEKT / "src"))
from geojson_pruefen import koordinaten_pruefen  # noqa: E402  (echte Prüflogik)


def kopieren(ziel: Path):
    for datei in subprocess.run(["git", "ls-files"], cwd=PROJEKT, capture_output=True, text=True,
                                encoding="utf-8", check=True).stdout.splitlines():
        if datei.startswith(("demo/", "tools/")):
            continue
        quelle, zieldatei = PROJEKT / datei, ziel / datei
        zieldatei.parent.mkdir(parents=True, exist_ok=True)
        inhalt = quelle.read_bytes()
        if datei.endswith((".geojson", ".json", ".py", ".md")):
            inhalt = inhalt.replace(b"\r\n", b"\n")  # Windows-Checkout mit CRLF: wie im Repository gespeichert (LF)
        zieldatei.write_bytes(inhalt)
    (ziel / "ausgabe").mkdir(exist_ok=True)


def lauf(befehl, cwd, anzeige, extra_env=None):
    env = {**os.environ, "PYTHONUTF8": "1", **(extra_env or {})}
    r = subprocess.run(befehl, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env)
    return {"befehl": anzeige, "rueckgabecode": r.returncode,
            "stdout": r.stdout.strip().replace("\r", ""), "stderr": r.stderr.strip().replace("\r", "")}


def qgis_pfad():
    kandidat = os.environ.get("QGIS_PYTHON") or os.path.join(
        os.environ.get("LOCALAPPDATA", ""), "Programs", "OSGeo4W", "bin", "python-qgis-ltr.bat")
    return kandidat if os.path.exists(kandidat) else None


def aequivalenzfaelle():
    """Prüffälle für den Vergleich Python-Original gegen JavaScript-Nachbau."""
    punkt = lambda k, lon, lat, z="offen", b="nord", s=True: {  # noqa: E731
        "type": "Feature", "properties": {"kennung": k, "zustand": z, "bezirk": b, "synthetisch": s},
        "geometry": {"type": "Point", "coordinates": [lon, lat]}}
    faelle = []
    grenzen = [[-180, -90], [180, 90], [180.1, 0], [0, 90.1], [-180.0001, 0], [0, -90.0001], [0, 0], [8.67, 95],
               [True, 0], [0, False], ["8", "50"], ["__NaN__", 0], [0, "__Inf__"], [None, 1], [1], [1, 2, 3], []]
    for nr, k in enumerate(grenzen):
        f = punkt(f"X{nr}", 0, 0)
        f["geometry"]["coordinates"] = k
        faelle.append([f])
    sonst = [punkt("A", 1, 1, z="geplant"), punkt("B", 1, 1, b=""), punkt("C", 1, 1, b=None), punkt("D", 1, 1, s=False),
             punkt("E", 1, 1, s="true"), punkt("", 1, 1), punkt(None, 1, 1), punkt(7, 1, 1)]
    faelle += [[f] for f in sonst]
    for g in ("Polygon", "LineString", None):
        f = punkt("P", 1, 1)
        f["geometry"] = {"type": g, "coordinates": [1, 1]} if g else None
        faelle.append([f])
    faelle.append([punkt("D1", 1, 1), punkt("D1", 2, 2), punkt("D2", 3, 3, z="erledigt", b="sued")])
    zufall = random.Random(4326)
    for _ in range(120):
        feat = []
        for i in range(zufall.randint(1, 6)):
            feat.append(punkt(f"Z{zufall.randint(1, 5)}", round(zufall.uniform(-200, 200), 3),
                              round(zufall.uniform(-100, 100), 3), z=zufall.choice(["offen", "erledigt", "offen", "x"]),
                              b=zufall.choice(["nord", "sued", "ost", ""]), s=zufall.choice([True, True, True, False])))
        faelle.append(feat)
    return faelle


def zu_python(wert):
    if wert == "__NaN__":
        return float("nan")
    if wert == "__Inf__":
        return float("inf")
    if isinstance(wert, list):
        return [zu_python(w) for w in wert]
    if isinstance(wert, dict):
        return {k: zu_python(v) for k, v in wert.items()}
    return wert


def main():
    jetzt = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with tempfile.TemporaryDirectory() as tmp:
        arbeit = Path(tmp) / "projekt"
        kopieren(arbeit)
        py = [sys.executable, "-X", "utf8"]
        schritte = [lauf(py + ["src/geojson_pruefen.py"], arbeit, "python -X utf8 src/geojson_pruefen.py"),
                    lauf(py + ["nachweise/P11-T03-pruefung.py"], arbeit, "python -X utf8 nachweise/P11-T03-pruefung.py")]
        qgis = qgis_pfad()
        qgis_daten = None
        env = {"QT_QPA_PLATFORM": "offscreen"}
        if qgis:
            schritte.append(lauf([qgis, "-X", "utf8", "nachweise/P11-T02-qgis-pruefung.py"], arbeit,
                                 "python-qgis-ltr.bat -X utf8 nachweise/P11-T02-qgis-pruefung.py", env))
            schritte.append(lauf([qgis, "-X", "utf8", "src/projekt_erstellen.py"], arbeit,
                                 "python-qgis-ltr.bat -X utf8 src/projekt_erstellen.py", env))
            ogr = json.loads((arbeit / "nachweise/P11-T02-qgis-pruefung.json").read_text(encoding="utf-8"))
            proj = json.loads((arbeit / "nachweise/P11-T04-projektpruefung.json").read_text(encoding="utf-8"))
            bild = arbeit / "nachweise/P11-T04-karte.png"
            if bild.exists():
                shutil.copy2(bild, DEMO / "wartungskarte-layout.png")
            qgis_daten = {
                "version": proj["qgis"],
                "ogr": {k: ogr[k] for k in ("provider", "objekte", "layerKbs", "projektKbs", "eingabeSha256", "ungueltig")},
                "projekt": {k: proj[k] for k in ("relativeDatenquellen", "erneutAnAnderemPfadGeoeffnet",
                                                 "gueltigePunkte", "zustandskategorien", "kbs")}}
        abgelehnt = json.loads((arbeit / "karten/abgelehnte.json").read_text(encoding="utf-8"))
        offen = json.loads((arbeit / "karten/offene-je-bezirk.json").read_text(encoding="utf-8"))
        eingabe = json.loads((arbeit / "beispieldaten/auftraege.geojson").read_text(encoding="utf-8"))
    for s in schritte:
        # Lokale Pfade dürfen nie in die Veröffentlichung gelangen.
        for feld in ("stdout", "stderr"):
            s[feld] = re.sub(r"[A-Za-z]:[\\/][^\s\"']+", "<Pfad entfernt>", s[feld])
    fehlgeschlagen = [s["befehl"] for s in schritte if s["rueckgabecode"] != 0]
    if fehlgeschlagen:
        raise SystemExit(f"Schritte mit Fehler: {fehlgeschlagen}")
    faelle = []
    for fall in aequivalenzfaelle():
        erg = koordinaten_pruefen({"type": "FeatureCollection", "features": zu_python(fall)})
        faelle.append({"eingabe": fall, "gueltig": [f["properties"]["kennung"] for f in erg["gueltig"]["features"]],
                       "abgelehnt": erg["abgelehnt"], "offenJeBezirk": erg["offenJeBezirk"]})
    daten = {"erzeugt": jetzt, "aequivalenzFaelle": len(faelle), "python": platform.python_version(), "qgisVerfuegbar": bool(qgis),
             "qgis": qgis_daten, "schritte": schritte, "abgelehnt": abgelehnt, "offenJeBezirk": offen,
             "eingabe": eingabe}
    (DEMO / "lauf-daten.js").write_text("window.LAUF = " + json.dumps(daten, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    (DEMO / "aequivalenz.json").write_text(json.dumps(faelle, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Demo-Daten geschrieben: {len(schritte)} Schritte, {len(faelle)} Vergleichsfälle, QGIS: {'ja' if qgis else 'nein'}")


if __name__ == "__main__":
    main()
