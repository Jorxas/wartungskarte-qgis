// JavaScript-Nachbau von koordinaten_pruefen() aus src/geojson_pruefen.py (Zeile für Zeile übertragen).
// Die Prüfung tools/browser-pruefen.cjs vergleicht ihn mit dem Python-Original auf demo/aequivalenz.json.
(function (wurzel, fabrik) {
  if (typeof module === "object" && module.exports) module.exports = fabrik();
  else wurzel.Pruefung = fabrik();
})(typeof self !== "undefined" ? self : this, function () {
  // Python-Wahrheitswert ("not x"): leer, 0, None und False gelten als falsch.
  function pyFalsch(w) {
    if (w === null || w === undefined || w === false || w === 0 || w === "") return true;
    if (Array.isArray(w)) return w.length === 0;
    if (typeof w === "object") return Object.keys(w).length === 0;
    return false;
  }
  function istZahl(w) { return typeof w === "number" && Number.isFinite(w); }

  function koordinatenPruefen(daten) {
    if (!daten || daten.type !== "FeatureCollection" || !Array.isArray(daten.features)) {
      throw new Error("Eine GeoJSON-FeatureCollection ist erforderlich.");
    }
    const gueltig = [], abgelehnt = [], kennungen = new Set();
    daten.features.forEach((objekt, index) => {
      const nummer = index + 1;
      const eigenschaften = pyFalsch(objekt.properties) ? {} : objekt.properties;
      const kennung = eigenschaften.kennung;
      const geometrie = pyFalsch(objekt.geometry) ? {} : objekt.geometry;
      const koordinaten = geometrie.coordinates;
      let grund = null;
      if (typeof kennung !== "string" || !kennung || kennungen.has(kennung)) {
        grund = "Kennung fehlt oder ist doppelt.";
      } else if (eigenschaften.synthetisch !== true) {
        grund = "Nur ausdrücklich synthetische Daten sind erlaubt.";
      } else if (eigenschaften.zustand !== "offen" && eigenschaften.zustand !== "erledigt" || pyFalsch(eigenschaften.bezirk)) {
        grund = "Zustand oder Bezirk fehlt beziehungsweise ist ungültig.";
      } else if (geometrie.type !== "Point" || !Array.isArray(koordinaten) || koordinaten.length !== 2) {
        grund = "Genau ein zweidimensionaler Punkt ist erforderlich.";
      } else if (koordinaten.some((w) => !istZahl(w))) {
        grund = "Koordinaten müssen endliche Zahlen sein.";
      } else if (!(-180 <= koordinaten[0] && koordinaten[0] <= 180)) {
        grund = "Längengrad außerhalb [-180, 180].";
      } else if (!(-90 <= koordinaten[1] && koordinaten[1] <= 90)) {
        grund = "Breitengrad außerhalb [-90, 90].";
      }
      if (typeof kennung === "string") kennungen.add(kennung);
      if (grund) abgelehnt.push({ zeile: nummer, kennung: kennung === undefined ? null : kennung, grund });
      else gueltig.push(objekt);
    });
    const zaehler = {};
    gueltig.forEach((e) => {
      if (e.properties.zustand === "offen") zaehler[e.properties.bezirk] = (zaehler[e.properties.bezirk] || 0) + 1;
    });
    const offenJeBezirk = {};
    Object.keys(zaehler).sort().forEach((k) => { offenJeBezirk[k] = zaehler[k]; });
    return { gueltig: { type: "FeatureCollection", features: gueltig }, abgelehnt, offenJeBezirk };
  }
  return { koordinatenPruefen };
});
