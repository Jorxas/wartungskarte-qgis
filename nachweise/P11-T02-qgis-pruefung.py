"""Originaldaten mit dem tatsächlich installierten QGIS-OGR-Provider prüfen."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from qgis.core import QgsApplication, QgsVectorLayer, QgsProject, QgsCoordinateReferenceSystem, Qgis

PROJEKT = Path(__file__).resolve().parents[1]
anwendung = QgsApplication([], False)
anwendung.initQgis()
eingabe = PROJEKT / "beispieldaten/auftraege.geojson"
layer = QgsVectorLayer(str(eingabe), "Originalaufträge", "ogr")
assert layer.isValid() and layer.featureCount() == 12
assert layer.crs().authid() == "EPSG:4326"
projekt = QgsProject.instance()
projekt.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))
ungueltig = []
for objekt in layer.getFeatures():
    punkt = objekt.geometry().asPoint()
    if not (-180 <= punkt.x() <= 180 and -90 <= punkt.y() <= 90):
        ungueltig.append({"kennung": objekt["kennung"], "laengengrad": punkt.x(),
                          "breitengrad": punkt.y(), "grund": "Breitengrad außerhalb [-90, 90]"})
assert [e["kennung"] for e in ungueltig] == ["G12"]
assert ungueltig[0]["breitengrad"] == 95
ausgabe = {"zeit": datetime.now(timezone.utc).isoformat(), "qgis": Qgis.QGIS_VERSION,
           "provider": layer.providerType(), "objekte": layer.featureCount(),
           "layerKbs": layer.crs().authid(), "projektKbs": projekt.crs().authid(),
           "eingabeSha256": hashlib.sha256(eingabe.read_bytes()).hexdigest(),
           "ungueltig": ungueltig, "desktopNachweis": "P11-T02-desktop-2026-11-17.json"}
(PROJEKT / "nachweise/P11-T02-qgis-pruefung.json").write_text(
    json.dumps(ausgabe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(ausgabe, ensure_ascii=False))
del layer
anwendung.exitQgis()
