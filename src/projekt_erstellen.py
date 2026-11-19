"""Portable QGIS-Projektdatei mit Layout und verständlicher Legende erstellen."""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from qgis.core import (QgsApplication, QgsProject, QgsCoordinateReferenceSystem, Qgis,
                       QgsReferencedRectangle, QgsPrintLayout, QgsLayoutItemMap,
                       QgsLayoutItemLabel, QgsLayoutItemLegend, QgsLayoutPoint,
                       QgsLayoutSize, QgsLayoutExporter, QgsTextFormat)
from qgis.PyQt.QtGui import QFont, QColor
from karte_erstellen import layer_erstellen

PROJEKT = Path(__file__).resolve().parents[1]
anwendung = QgsApplication([], False)
anwendung.initQgis()
anwendung.setFont(QFont("Arial", 10))
layer = layer_erstellen()
projekt = QgsProject.instance()
projekt.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))
projekt.setTitle("Kommunale Wartungskarte — synthetische Daten")
projekt.setFilePathStorage(Qgis.FilePathType.Relative)
projekt.addMapLayer(layer)
ausdehnung = layer.extent()
ausdehnung.scale(1.25)
projekt.viewSettings().setDefaultViewExtent(QgsReferencedRectangle(ausdehnung, projekt.crs()))
layout = QgsPrintLayout(projekt)
layout.initializeDefaults()
layout.setName("Wartungsübersicht")
layout.pageCollection().page(0).setPageSize(QgsLayoutSize(297, 210))
projekt.layoutManager().addLayout(layout)


def text_hinzufuegen(text, x, y, breite, hoehe, groesse=11):
    element = QgsLayoutItemLabel(layout)
    element.setText(text)
    formatierung = QgsTextFormat()
    formatierung.setFont(QFont("Arial"))
    formatierung.setSize(groesse)
    element.setTextFormat(formatierung)
    layout.addLayoutItem(element)
    element.attemptMove(QgsLayoutPoint(x, y))
    element.attemptResize(QgsLayoutSize(breite, hoehe))
    return element


text_hinzufuegen("Kommunale Wartungskarte", 10, 8, 275, 12, 20)
text_hinzufuegen("Studentische Übung · ausschließlich synthetische Daten · EPSG:4326", 10, 21, 275, 10, 10)
karte = QgsLayoutItemMap(layout)
layout.addLayoutItem(karte)
karte.attemptMove(QgsLayoutPoint(10, 36))
karte.attemptResize(QgsLayoutSize(202, 155))
karte.setLayers([layer])
karte.setKeepLayerSet(True)
karte.setCrs(projekt.crs())
karte.zoomToExtent(ausdehnung)
karte.setBackgroundColor(QColor("#f4f7fa"))
karte.setFrameEnabled(True)
legende = QgsLayoutItemLegend(layout)
legende.setTitle("Auftragszustand")
legende.setLinkedMap(karte)
layout.addLayoutItem(legende)
legende.attemptMove(QgsLayoutPoint(220, 40))
for komponente in [Qgis.LegendComponent.Title, Qgis.LegendComponent.Group,
                   Qgis.LegendComponent.Subgroup, Qgis.LegendComponent.SymbolLabel]:
    formatierung = QgsTextFormat()
    formatierung.setFont(QFont("Arial"))
    formatierung.setSize(11)
    legende.rstyle(komponente).setTextFormat(formatierung)
text_hinzufuegen("Offene Aufträge\nnord: 4\nsued: 3\ngesamt: 7", 220, 94, 67, 38)
text_hinzufuegen("11 gültige Punkte\nG12 ausgeschlossen:\nBreitengrad 95 ist\naußerhalb [-90, 90].", 220, 139, 67, 42, 10)
text_hinzufuegen("Originaleingabe: 12 Punkte. Keine Prüfung gegen reale Gemeindegrenzen; keine Hintergrundkarte.", 10, 195, 277, 9, 9)
ausgabe = PROJEKT / "karten/wartung.qgz"
assert projekt.write(str(ausgabe)), "Projekt konnte nicht gespeichert werden."
exporteur = QgsLayoutExporter(layout)
einstellungen = QgsLayoutExporter.ImageExportSettings()
einstellungen.dpi = 150
bild = PROJEKT / "nachweise/P11-T04-karte.png"
assert exporteur.exportToImage(str(bild), einstellungen) == QgsLayoutExporter.Success

# Wirklich an einem anderen Pfad öffnen, damit relative Datenquellen geprüft sind.
testordner = PROJEKT / "ausgabe/portabilitaetspruefung"
testordner.mkdir(parents=True, exist_ok=True)
shutil.copy2(ausgabe, testordner / ausgabe.name)
shutil.copy2(PROJEKT / "karten/gueltige-auftraege.geojson", testordner / "gueltige-auftraege.geojson")
gelesen = QgsProject()
assert gelesen.read(str(testordner / ausgabe.name))
geladene_layer = list(gelesen.mapLayers().values())
assert len(geladene_layer) == 1 and geladene_layer[0].isValid()
assert geladene_layer[0].featureCount() == 11
assert len(geladene_layer[0].renderer().categories()) == 2
assert gelesen.crs().authid() == "EPSG:4326"
assert gelesen.layoutManager().layoutByName("Wartungsübersicht")
nachweis = {"zeit": datetime.now(timezone.utc).isoformat(), "qgis": Qgis.QGIS_VERSION,
            "projekt": "karten/wartung.qgz", "relativeDatenquellen": True,
            "erneutAnAnderemPfadGeoeffnet": True, "gueltigePunkte": 11,
            "zustandskategorien": 2, "kbs": gelesen.crs().authid(),
            "originalSha256": hashlib.sha256((PROJEKT / "beispieldaten/auftraege.geojson").read_bytes()).hexdigest(),
            "projektSha256": hashlib.sha256(ausgabe.read_bytes()).hexdigest(),
            "bildSha256": hashlib.sha256(bild.read_bytes()).hexdigest(),
            "grenze": "QGIS-Layout und Projektprüfung; Desktopaufnahme wird separat tatsächlich erstellt."}
(PROJEKT / "nachweise/P11-T04-projektpruefung.json").write_text(json.dumps(nachweis, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("BESTANDEN: echte portable QGIS-Projektdatei, Legende, Layout und erneutes Öffnen mit elf Punkten.")
