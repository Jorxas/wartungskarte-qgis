(function () {
  "use strict";
  var TEXT = window.TEXT, LAUF = window.LAUF;
  var original = LAUF.eingabe.features;
  var lang = "de";
  var filter = "alle";
  // Zustand: pro Auftrag die eingetippten Texte für Längen- und Breitengrad.
  var werte = [];

  function t(key, vars) {
    var s = (TEXT[lang][key] !== undefined ? TEXT[lang][key] : TEXT.de[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function el(tag, attrs, kinder) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kinder || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function svg(tag, attrs, text) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text) e.textContent = text;
    return e;
  }
  function zahlFormat(n, stellen) {
    return new Intl.NumberFormat(TEXT[lang].htmlLang, { maximumFractionDigits: stellen === undefined ? 6 : stellen }).format(n);
  }

  function startwerte() {
    werte = original.map(function (f) {
      return { lon: zahlFormat(f.geometry.coordinates[0]), lat: zahlFormat(f.geometry.coordinates[1]) };
    });
  }
  // Eingabetext in Zahl umwandeln; alles andere bleibt Text und wird von der Prüfung abgewiesen.
  function parse(text) {
    var s = String(text).trim().replace(/\s/g, "").replace(",", ".");
    return /^[-+−]?\d+(\.\d+)?$/.test(s) ? Number(s.replace("−", "-")) : text;
  }
  function aktuelleDaten() {
    return {
      type: "FeatureCollection",
      features: original.map(function (f, i) {
        return { type: "Feature", properties: f.properties,
          geometry: { type: "Point", coordinates: [parse(werte[i].lon), parse(werte[i].lat)] } };
      })
    };
  }

  function pruefen() {
    return window.Pruefung.koordinatenPruefen(aktuelleDaten());
  }
  function grundText(g) {
    var m = TEXT[lang].gruende || {};
    return m[g] || g;
  }
  function zustandText(z) { return t(z); }

  function tabelleZeichnen() {
    var erg = pruefen();
    var abg = {};
    erg.abgelehnt.forEach(function (a) { abg[a.zeile] = a.grund; });
    var tbody = document.querySelector("#tabelle tbody");
    var aktiv = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.feld : null;
    tbody.textContent = "";
    original.forEach(function (f, i) {
      var p = f.properties;
      if (filter !== "alle" && p.zustand !== filter) return;
      var grund = abg[i + 1];
      var tr = el("tr", { class: grund ? "falsch" : "" });
      tr.appendChild(el("td", { "data-l": t("colKennung"), text: p.kennung, class: "kennung" }));
      tr.appendChild(el("td", { "data-l": t("colZustand") }, [el("span", { class: "marke " + p.zustand, text: zustandText(p.zustand) })]));
      tr.appendChild(el("td", { "data-l": t("colBezirk"), text: p.bezirk }));
      ["lon", "lat"].forEach(function (feld) {
        var eingabe = el("input", { type: "text", inputmode: "decimal", autocomplete: "off", spellcheck: "false",
          value: werte[i][feld], "data-feld": feld + i,
          "aria-label": t(feld === "lon" ? "lonLabel" : "latLabel", { k: p.kennung }) });
        if (grund) eingabe.setAttribute("aria-invalid", "true");
        eingabe.addEventListener("input", function () { werte[i][feld] = eingabe.value; ergebnisZeichnen(); zeilenStatus(); });
        tr.appendChild(el("td", { "data-l": t(feld === "lon" ? "colLon" : "colLat") }, [eingabe]));
      });
      var status = el("td", { "data-l": t("colPruefung"), "data-status": String(i) });
      tr.appendChild(status);
      tbody.appendChild(tr);
    });
    zeilenStatus();
    if (aktiv) { var w = tbody.querySelector('[data-feld="' + aktiv + '"]'); if (w) w.focus(); }
  }

  // Status je Zeile aktualisieren, ohne die Eingabefelder neu aufzubauen (Fokus bleibt erhalten).
  function zeilenStatus() {
    var erg = pruefen();
    var abg = {};
    erg.abgelehnt.forEach(function (a) { abg[a.zeile] = a.grund; });
    document.querySelectorAll("#tabelle tbody tr").forEach(function (tr) {
      var td = tr.querySelector("[data-status]");
      var i = Number(td.getAttribute("data-status"));
      var grund = abg[i + 1];
      td.textContent = "";
      td.appendChild(el("span", { class: "status " + (grund ? "nein" : "ja"), text: grund ? t("abgelehnt") : t("gueltig") }));
      if (grund) td.appendChild(el("span", { class: "grund", text: grundText(grund) }));
      tr.className = grund ? "falsch" : "";
      tr.querySelectorAll("input").forEach(function (inp) {
        if (grund) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid");
      });
    });
  }

  function ergebnisZeichnen() {
    var erg = pruefen();
    var n = original.length;
    var z = document.getElementById("zahlen");
    z.textContent = "";
    var offen = erg.offenJeBezirk;
    var offenGesamt = Object.keys(offen).reduce(function (s, k) { return s + offen[k]; }, 0);
    function kachel(wert, text, klasse) {
      return el("div", { class: "kachel " + (klasse || "") }, [el("strong", { text: wert }), el("span", { text: text })]);
    }
    z.appendChild(kachel(zahlFormat(erg.gueltig.features.length) + " " + t("von") + " " + zahlFormat(n), t("kGueltig"), "ok"));
    z.appendChild(kachel(zahlFormat(erg.abgelehnt.length), t("kAbgelehnt"), erg.abgelehnt.length ? "warn" : ""));
    var teile = Object.keys(offen).map(function (k) { return k + " " + zahlFormat(offen[k]); }).join(" · ");
    z.appendChild(kachel(zahlFormat(offenGesamt), t("kOffen") + (teile ? " (" + teile + ")" : "")));
    var ul = document.getElementById("gruende");
    ul.textContent = "";
    if (!erg.abgelehnt.length) ul.appendChild(el("li", { class: "still", text: t("keineAbgelehnt") }));
    erg.abgelehnt.forEach(function (a) {
      ul.appendChild(el("li", {}, [el("strong", { text: (a.kennung === null ? t("zeilenpunkt") + " " + a.zeile : a.kennung) + ": " }),
        document.createTextNode(grundText(a.grund))]));
    });
    vorschau(erg);
  }

  function vorschau(erg) {
    var s = document.getElementById("vorschau");
    s.textContent = "";
    s.setAttribute("aria-label", t("vorschauAlt"));
    var pts = erg.gueltig.features.filter(function (f) { return filter === "alle" || f.properties.zustand === filter; });
    var alle = erg.gueltig.features;
    if (!alle.length) {
      s.appendChild(svg("text", { x: 300, y: 150, "text-anchor": "middle", class: "svg-still" }, t("keinePunkte")));
      return;
    }
    var xs = alle.map(function (f) { return f.geometry.coordinates[0]; }), ys = alle.map(function (f) { return f.geometry.coordinates[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var dx = (x1 - x0) || 0.01, dy = (y1 - y0) || 0.01;
    // Gleicher Maßstab in Grad auf beiden Achsen (wie im QGIS-Projekt mit EPSG:4326).
    var rand = 46, B = 600 - 2 * rand - 20, H = 300 - 2 * rand;
    var skala = Math.min(B / (dx * 1.1), H / (dy * 1.1));
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    var px = function (x) { return 310 + (x - cx) * skala; };
    var py = function (y) { return 150 - (y - cy) * skala; };
    s.appendChild(svg("rect", { x: 0.5, y: 0.5, width: 599, height: 299, class: "svg-rahmen" }));
    [[x0, "lon"], [x1, "lon"]].forEach(function (p) {
      s.appendChild(svg("text", { x: px(p[0]), y: 292, "text-anchor": "middle", class: "svg-achse" }, zahlFormat(p[0], 3) + "°"));
    });
    [y0, y1].forEach(function (y) {
      s.appendChild(svg("text", { x: 8, y: py(y) + 4, class: "svg-achse" }, zahlFormat(y, 3) + "°"));
    });
    pts.forEach(function (f) {
      var x = px(f.geometry.coordinates[0]), y = py(f.geometry.coordinates[1]);
      if (f.properties.zustand === "offen") s.appendChild(svg("circle", { cx: x, cy: y, r: 6, class: "pkt-offen" }));
      else s.appendChild(svg("rect", { x: x - 6, y: y - 6, width: 12, height: 12, class: "pkt-erledigt" }));
      s.appendChild(svg("text", { x: x + 8, y: y - 8, class: "svg-label" }, f.properties.kennung));
    });
    var lx = 480;
    s.appendChild(svg("circle", { cx: lx, cy: 22, r: 6, class: "pkt-offen" }));
    s.appendChild(svg("text", { x: lx + 12, y: 26, class: "svg-achse" }, t("legOffen")));
    s.appendChild(svg("rect", { x: lx + 70 - 6, y: 16, width: 12, height: 12, class: "pkt-erledigt" }));
    s.appendChild(svg("text", { x: lx + 82, y: 26, class: "svg-achse" }, t("legErledigt")));
  }

  function befund() {
    var dl = document.getElementById("befund");
    dl.textContent = "";
    var q = LAUF.qgis;
    if (!q) return;
    function zeile(k, v) { dl.appendChild(el("div", {}, [el("dt", { text: t(k) }), el("dd", { text: v })])); }
    var ja = function (b) { return b ? t("ja") : t("nein"); };
    zeile("bProvider", q.ogr.provider);
    zeile("bObjekte", zahlFormat(q.ogr.objekte));
    zeile("bLayerKbs", q.ogr.layerKbs);
    zeile("bProjektKbs", q.ogr.projektKbs);
    zeile("bUngueltig", q.ogr.ungueltig.map(function (u) {
      return u.kennung + " (" + zahlFormat(u.laengengrad) + " / " + zahlFormat(u.breitengrad) + ")";
    }).join(", "));
    zeile("bRelativ", ja(q.projekt.relativeDatenquellen));
    zeile("bAnderer", ja(q.projekt.erneutAnAnderemPfadGeoeffnet));
    zeile("bPunkte", zahlFormat(q.projekt.gueltigePunkte));
    zeile("bKategorien", zahlFormat(q.projekt.zustandskategorien));
  }

  function schritte() {
    var box = document.getElementById("schritte");
    box.textContent = "";
    LAUF.schritte.forEach(function (s) {
      var ausgabe = s.stdout;
      try { ausgabe = JSON.stringify(JSON.parse(s.stdout), null, 2); } catch (e) { /* kein JSON: Text bleibt */ }
      var d = el("details", { class: "schritt" }, [
        el("summary", {}, [el("code", { text: s.befehl }), el("span", { class: "rc", text: " · " + t("rueckgabe") + " " + s.rueckgabecode })]),
        el("p", { class: "klein", text: t("ausgabeStd") }),
        el("pre", { text: ausgabe })
      ]);
      if (s.stderr) {
        d.appendChild(el("p", { class: "klein", text: t("hinweisTreiber") }));
        d.appendChild(el("pre", { text: s.stderr }));
      }
      box.appendChild(d);
    });
  }

  function statischeTexte() {
    document.documentElement.lang = TEXT[lang].htmlLang;
    document.title = t("titel");
    document.querySelectorAll("[data-i]").forEach(function (e) { e.textContent = t(e.getAttribute("data-i")); });
    document.querySelectorAll("[data-alt]").forEach(function (e) { e.setAttribute("alt", t(e.getAttribute("data-alt"))); });
    document.querySelectorAll("[data-aria]").forEach(function (e) { e.setAttribute("aria-label", t(e.getAttribute("data-aria"))); });
    document.getElementById("ehrlich").textContent = t("ehrlich", { n: zahlFormat(LAUF.aequivalenzFaelle) });
    var datum = new Intl.DateTimeFormat(TEXT[lang].htmlLang, { dateStyle: "long", timeZone: "UTC" }).format(new Date(LAUF.erzeugt));
    document.getElementById("echt-lead").textContent = LAUF.qgisVerfuegbar && LAUF.qgis
      ? t("echtLead", { datum: datum, py: LAUF.python, qgis: LAUF.qgis.version })
      : t("echtLeadOhne", { datum: datum, py: LAUF.python });
    document.querySelectorAll("#sprache button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  function alleZeichnen() {
    statischeTexte();
    tabelleZeichnen();
    ergebnisZeichnen();
    befund();
    schritte();
  }

  function spracheSetzen(neu) {
    lang = neu;
    try {
      var url = new URL(location.href);
      if (neu === "de") url.searchParams.delete("lang"); else url.searchParams.set("lang", neu);
      history.replaceState(null, "", url);
    } catch (e) { /* ohne Adressleiste egal */ }
    alleZeichnen();
  }

  document.querySelectorAll("#sprache button").forEach(function (b) {
    b.addEventListener("click", function () { spracheSetzen(b.getAttribute("data-lang")); });
  });
  document.querySelectorAll("#filter button").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-f");
      document.querySelectorAll("#filter button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      tabelleZeichnen();
      ergebnisZeichnen();
    });
  });
  document.getElementById("reset").addEventListener("click", function () { startwerte(); tabelleZeichnen(); ergebnisZeichnen(); });
  document.getElementById("g12").addEventListener("click", function () {
    var i = original.findIndex(function (f) { return f.properties.kennung === "G12"; });
    werte[i].lat = zahlFormat(50.59);
    if (filter !== "alle") { filter = "alle"; document.querySelectorAll("#filter button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-f") === "alle")); }); }
    tabelleZeichnen();
    ergebnisZeichnen();
  });

  var gewuenscht = new URLSearchParams(location.search).get("lang");
  if (gewuenscht === "fr") lang = "fr";
  startwerte();
  alleZeichnen();
})();
