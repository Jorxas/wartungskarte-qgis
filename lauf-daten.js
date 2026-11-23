window.LAUF = {
 "erzeugt": "2026-11-23T09:03:18+00:00",
 "aequivalenzFaelle": 149,
 "python": "3.13.14",
 "qgisVerfuegbar": true,
 "qgis": {
  "version": "3.44.15-Solothurn",
  "ogr": {
   "provider": "ogr",
   "objekte": 12,
   "layerKbs": "EPSG:4326",
   "projektKbs": "EPSG:4326",
   "eingabeSha256": "a7e72120289bf7869c408ab9ccd5f7076b9a44ff4b065e8903fd54467e6de9a5",
   "ungueltig": [
    {
     "kennung": "G12",
     "laengengrad": 8.67,
     "breitengrad": 95.0,
     "grund": "Breitengrad außerhalb [-90, 90]"
    }
   ]
  },
  "projekt": {
   "relativeDatenquellen": true,
   "erneutAnAnderemPfadGeoeffnet": true,
   "gueltigePunkte": 11,
   "zustandskategorien": 2,
   "kbs": "EPSG:4326"
  }
 },
 "schritte": [
  {
   "befehl": "python -X utf8 src/geojson_pruefen.py",
   "rueckgabecode": 0,
   "stdout": "{\"gueltigePunkte\": 11, \"abgelehnt\": [{\"zeile\": 12, \"kennung\": \"G12\", \"grund\": \"Breitengrad außerhalb [-90, 90].\"}], \"offenJeBezirk\": {\"nord\": 4, \"sued\": 3}}",
   "stderr": ""
  },
  {
   "befehl": "python -X utf8 nachweise/P11-T03-pruefung.py",
   "rueckgabecode": 0,
   "stdout": "BESTANDEN: Original unverändert, elf gültige Punkte, G12 begründet ausgeschlossen; nord=4, sued=3; echte Grenzfälle geprüft.",
   "stderr": ""
  },
  {
   "befehl": "python-qgis-ltr.bat -X utf8 nachweise/P11-T02-qgis-pruefung.py",
   "rueckgabecode": 0,
   "stdout": "{\"zeit\": \"2026-11-23T09:03:20.498666+00:00\", \"qgis\": \"3.44.15-Solothurn\", \"provider\": \"ogr\", \"objekte\": 12, \"layerKbs\": \"EPSG:4326\", \"projektKbs\": \"EPSG:4326\", \"eingabeSha256\": \"a7e72120289bf7869c408ab9ccd5f7076b9a44ff4b065e8903fd54467e6de9a5\", \"ungueltig\": [{\"kennung\": \"G12\", \"laengengrad\": 8.67, \"breitengrad\": 95.0, \"grund\": \"Breitengrad außerhalb [-90, 90]\"}], \"desktopNachweis\": \"P11-T02-desktop-2026-11-17.json\"}",
   "stderr": ""
  },
  {
   "befehl": "python-qgis-ltr.bat -X utf8 src/projekt_erstellen.py",
   "rueckgabecode": 0,
   "stdout": "BESTANDEN: echte portable QGIS-Projektdatei, Legende, Layout und erneutes Öffnen mit elf Punkten.",
   "stderr": "ERROR 6: The PNG driver does not support update access to existing datasets."
  }
 ],
 "abgelehnt": [
  {
   "zeile": 12,
   "kennung": "G12",
   "grund": "Breitengrad außerhalb [-90, 90]."
  }
 ],
 "offenJeBezirk": {
  "nord": 4,
  "sued": 3
 },
 "eingabe": {
  "type": "FeatureCollection",
  "features": [
   {
    "type": "Feature",
    "properties": {
     "kennung": "G1",
     "zustand": "erledigt",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.65,
      50.58
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G2",
     "zustand": "offen",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.653,
      50.580999999999996
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G3",
     "zustand": "offen",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.656,
      50.582
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G4",
     "zustand": "erledigt",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.659,
      50.583
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G5",
     "zustand": "offen",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.662,
      50.583999999999996
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G6",
     "zustand": "offen",
     "bezirk": "nord",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.665000000000001,
      50.585
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G7",
     "zustand": "erledigt",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.668000000000001,
      50.586
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G8",
     "zustand": "offen",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.671000000000001,
      50.586999999999996
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G9",
     "zustand": "offen",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.674,
      50.588
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G10",
     "zustand": "erledigt",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.677,
      50.589
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G11",
     "zustand": "offen",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.68,
      50.589999999999996
     ]
    }
   },
   {
    "type": "Feature",
    "properties": {
     "kennung": "G12",
     "zustand": "offen",
     "bezirk": "sued",
     "synthetisch": true
    },
    "geometry": {
     "type": "Point",
     "coordinates": [
      8.67,
      95
     ]
    }
   }
  ]
 }
};
