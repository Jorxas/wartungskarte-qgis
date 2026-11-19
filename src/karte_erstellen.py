"""Echte QGIS-Symbologie erzeugen und eine lokale Vorschau rendern."""
from pathlib import Path
import os
from qgis.core import (QgsApplication, QgsVectorLayer, QgsProject, QgsCoordinateReferenceSystem,
                       QgsMarkerSymbol, QgsRendererCategory, QgsCategorizedSymbolRenderer,
                       QgsMapSettings, QgsMapRendererParallelJob, QgsPalLayerSettings,
                       QgsVectorLayerSimpleLabeling, QgsTextFormat)
from qgis.PyQt.QtCore import QSize
from qgis.PyQt.QtGui import QColor, QFont, QFontDatabase
from geojson_pruefen import ausgaben_erstellen

PROJEKT = Path(__file__).resolve().parents[1]


def layer_erstellen():
    # Die Offscreen-Plattform findet Windows-Schriften nicht immer automatisch.
    schriftdatei = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts/arial.ttf"
    if schriftdatei.exists():
        if QFontDatabase.addApplicationFont(str(schriftdatei)) < 0:
            raise ValueError("Die vorhandene Arial-Schrift konnte nicht geladen werden.")
    ausgaben_erstellen()
    layer = QgsVectorLayer(str(PROJEKT / "karten/gueltige-auftraege.geojson"), "Wartungsaufträge", "ogr")
    if not layer.isValid() or layer.featureCount() != 11:
        raise ValueError("Der erwartete gültige QGIS-Layer mit elf Punkten fehlt.")
    kategorien = []
    for wert, farbe, form, beschriftung in [
            ("offen", "#205caa", "circle", "Offen"),
            ("erledigt", "#26804b", "square", "Erledigt")]:
        symbol = QgsMarkerSymbol.createSimple({"name": form, "color": farbe, "size": "3.5", "outline_color": "white"})
        kategorien.append(QgsRendererCategory(wert, symbol, beschriftung))
    layer.setRenderer(QgsCategorizedSymbolRenderer("zustand", kategorien))
    beschriftung = QgsPalLayerSettings()
    beschriftung.fieldName = "kennung"
    formatierung = QgsTextFormat()
    formatierung.setFont(QFont("Arial"))
    formatierung.setSize(10)
    beschriftung.setFormat(formatierung)
    layer.setLabeling(QgsVectorLayerSimpleLabeling(beschriftung))
    layer.setLabelsEnabled(True)
    return layer


if __name__ == "__main__":
    anwendung = QgsApplication([], False)
    anwendung.initQgis()
    layer = layer_erstellen()
    projekt = QgsProject.instance()
    projekt.setCrs(QgsCoordinateReferenceSystem("EPSG:4326"))
    projekt.addMapLayer(layer)
    einstellungen = QgsMapSettings()
    einstellungen.setLayers([layer])
    einstellungen.setDestinationCrs(projekt.crs())
    einstellungen.setBackgroundColor(QColor("#f4f7fa"))
    einstellungen.setOutputSize(QSize(1200, 700))
    ausdehnung = layer.extent()
    ausdehnung.scale(1.3)
    einstellungen.setExtent(ausdehnung)
    renderlauf = QgsMapRendererParallelJob(einstellungen)
    renderlauf.start()
    renderlauf.waitForFinished()
    assert renderlauf.renderedImage().save(str(PROJEKT / "nachweise/P11-T03-kartenvorschau.png"), "PNG")
    assert len(layer.renderer().categories()) == 2
    print("BESTANDEN: elf Punkte, zwei unterscheidbare Zustände und echte QGIS-Kartenvorschau.")
