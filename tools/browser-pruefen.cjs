// Prüft die gebaute Demo im echten Browser, wie sie auf GitHub Pages unter /wartungskarte-qgis/ ausgeliefert wird.
//   node tools/bauen.cjs && node tools/browser-pruefen.cjs [--bild=ordner]
// Braucht puppeteer-core (NODE_PATH) und einen installierten Chrome oder Edge (BROWSER_PFAD).
// Prüft: Gleichheit des JavaScript-Nachbaus mit dem Python-Original, Deutsch als Standard, Wechsel auf Französisch und zurück,
// Bedienung, Laufzeitfehler, externe Anfragen, horizontalen Überlauf bei 390 px.
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), assert = require("node:assert/strict");
const dist = path.resolve(__dirname, "../dist");
const bildOrdner = process.argv.find((a) => a.startsWith("--bild="))?.slice(7);
const BASIS = "/wartungskarte-qgis";

// 1. Nachbau gegen Python-Original
{
  const P = require("../demo/pruefung.js");
  const faelle = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../demo/aequivalenz.json"), "utf8"));
  const m = (w) => w === "__NaN__" ? NaN : w === "__Inf__" ? Infinity : Array.isArray(w) ? w.map(m)
    : (w && typeof w === "object") ? Object.fromEntries(Object.entries(w).map(([k, v]) => [k, m(v)])) : w;
  for (const [i, f] of faelle.entries()) {
    const r = P.koordinatenPruefen({ type: "FeatureCollection", features: m(f.eingabe) });
    assert.deepEqual([r.gueltig.features.map((x) => x.properties.kennung), r.abgelehnt, r.offenJeBezirk],
      [f.gueltig, f.abgelehnt, f.offenJeBezirk], `Abweichung vom Python-Original bei Fall ${i}`);
  }
  console.log(`Nachbau stimmt mit dem Python-Original überein (${faelle.length} Fälle).`);
}

const typen = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (!p.startsWith(BASIS + "/")) { r.statusCode = 404; return r.end("nicht gefunden"); }
  p = p.slice(BASIS.length) || "/";
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(dist, p);
  if (!f.startsWith(dist) || !fs.existsSync(f)) { r.statusCode = 404; return r.end("nicht gefunden"); }
  r.setHeader("Content-Type", typen[path.extname(f)] || "application/octet-stream");
  r.end(fs.readFileSync(f));
});
const puppeteer = require("puppeteer-core");
const browserPfad = process.env.BROWSER_PFAD || ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((f) => fs.existsSync(f));
if (!browserPfad) throw new Error("BROWSER_PFAD auf einen installierten Chrome oder Edge setzen.");
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const basis = `http://127.0.0.1:${server.address().port}${BASIS}/`;
  const browser = await puppeteer.launch({ executablePath: browserPfad, headless: true });
  const fehler = [], extern = [];
  if (bildOrdner) fs.mkdirSync(bildOrdner, { recursive: true });
  try {
    const s = await browser.newPage();
    s.on("pageerror", (e) => fehler.push("Seitenfehler: " + e.message));
    s.on("console", (m) => { if (m.type() === "error") fehler.push("Konsole: " + m.text()); });
    s.on("requestfailed", (r) => fehler.push("Anfrage fehlgeschlagen: " + r.url()));
    s.on("response", (r) => { if (r.status() >= 400) fehler.push(`HTTP ${r.status()}: ${r.url()}`); });
    s.on("request", (r) => { if (!r.url().startsWith("data:") && new URL(r.url()).hostname !== "127.0.0.1") extern.push(r.url()); });
    const text = () => s.$eval("body", (e) => e.innerText);
    const zeilen = () => s.$$eval("#tabelle tbody tr", (t) => t.length);
    const lang = () => s.$eval("html", (e) => e.lang);
    const ueberlauf = () => s.evaluate(() => document.documentElement.scrollWidth > innerWidth);

    // Deutsch als Standard
    await s.setViewport({ width: 1280, height: 900 });
    await s.goto(basis, { waitUntil: "networkidle0" });
    assert.equal(await lang(), "de-DE");
    assert.equal(await s.title(), "Wartungskarte QGIS Demo");
    let t = await text();
    for (const w of ["Wartungsaufträge in QGIS kartieren", "Aufgabe", "Ergebnis", "Grenzen", "Ausgabe eines echten Laufs des Projekts", "11 von 12", "Breitengrad außerhalb [-90, 90]."])
      assert(t.toLowerCase().includes(w.toLowerCase()), `Deutsch: "${w}" fehlt`);
    assert.equal(await zeilen(), 12);
    assert.equal(await s.$eval('[data-lang="de"]', (b) => b.getAttribute("aria-pressed")), "true");
    assert(await s.$eval("img", (i) => i.complete && i.naturalWidth > 1000), "QGIS-Bild geladen");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "desktop-de.png"), fullPage: true });

    // Bedienung: G12 korrigieren, eigene Eingabe, Filter, Zurücksetzen
    await s.click("#g12");
    await warte(100);
    assert((await text()).includes("12 von 12"), "G12 korrigiert, zwölf gültig");
    await s.click("#reset");
    assert((await text()).includes("11 von 12"));
    const lat1 = '[data-feld="lat0"]';
    await s.$eval(lat1, (e) => { e.focus(); e.select(); });
    await s.type(lat1, "91");
    await warte(100);
    t = await text();
    assert(t.includes("10 von 12") && t.includes("Breitengrad außerhalb"), "91 als Breitengrad abgelehnt");
    assert.equal(await s.$eval(lat1, (i) => i === document.activeElement), true, "Fokus bleibt im Feld");
    await s.$eval(lat1, (e) => { e.focus(); e.select(); });
    await s.type(lat1, "abc");
    await warte(100);
    assert((await text()).includes("Koordinaten müssen endliche Zahlen sein."), "Text statt Zahl abgelehnt");
    await s.click("#reset");
    await s.click('[data-f="offen"]');
    assert.equal(await zeilen(), 8, "acht offene Aufträge in der Tabelle (G12 eingeschlossen)");
    await s.click('[data-f="alle"]');
    assert.equal(await zeilen(), 12);

    // Wechsel auf Französisch
    await s.click('[data-lang="fr"]');
    await warte(100);
    assert.equal(await lang(), "fr-FR");
    assert(s.url().includes("lang=fr"));
    assert.equal(await s.title(), "Démo Wartungskarte QGIS");
    t = await text();
    for (const w of ["Cartographier des ordres de maintenance avec QGIS", "Tâche", "Données", "Limites", "Sortie d'une vraie exécution du projet", "11 sur 12", "Latitude hors de [-90, 90]."])
      assert(t.toLowerCase().includes(w.toLowerCase()), `Französisch: "${w}" fehlt`);
    assert(!t.includes("Wartungsaufträge in QGIS kartieren"), "keine deutsche Überschrift mehr");
    assert.equal(await s.$eval('[data-lang="fr"]', (b) => b.getAttribute("aria-pressed")), "true");
    assert.equal(await zeilen(), 12);
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "desktop-fr.png"), fullPage: true });

    // Zurück auf Deutsch
    await s.click('[data-lang="de"]');
    await warte(100);
    assert.equal(await lang(), "de-DE");
    assert(!s.url().includes("lang="));
    assert((await text()).toLowerCase().includes("aufgabe"));

    // Direktaufruf ?lang=fr
    await s.goto(basis + "?lang=fr", { waitUntil: "networkidle0" });
    assert.equal(await lang(), "fr-FR");
    assert((await text()).toLowerCase().includes("tâche"));

    // Tastatur: Sprachumschalter per Tab erreichbar und per Enter bedienbar
    await s.goto(basis, { waitUntil: "networkidle0" });
    await s.keyboard.press("Tab"); // Link zum Springen
    await s.keyboard.press("Tab"); // DE
    await s.keyboard.press("Tab"); // FR
    assert.equal(await s.evaluate(() => document.activeElement.getAttribute("data-lang")), "fr");
    await s.keyboard.press("Enter");
    await warte(100);
    assert.equal(await lang(), "fr-FR");

    // Handy 390 px: kein horizontaler Überlauf (beide Sprachen)
    await s.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await s.goto(basis, { waitUntil: "networkidle0" });
    assert.equal(await ueberlauf(), false, "Überlauf auf dem Handy (DE)");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "handy-de.png"), fullPage: true });
    await s.goto(basis + "?lang=fr", { waitUntil: "networkidle0" });
    assert.equal(await ueberlauf(), false, "Überlauf auf dem Handy (FR)");
    await s.click("#g12");
    await s.click('[data-f="erledigt"]');
    assert.equal(await ueberlauf(), false, "Überlauf nach Bedienung");
    if (bildOrdner) await s.screenshot({ path: path.join(bildOrdner, "handy-fr.png"), fullPage: true });
  } finally { await browser.close(); server.close(); }
  assert.deepEqual(fehler, [], "keine Laufzeitfehler");
  assert.deepEqual(extern, [], "keine externen Anfragen");
  console.log("Browserprüfung bestanden: Deutsch als Standard, Wechsel auf Französisch und zurück, Bedienung, 390 px ohne Überlauf, keine Fehler, keine externen Anfragen.");
})().catch((e) => { console.error(e); process.exitCode = 1; server.close(); });
