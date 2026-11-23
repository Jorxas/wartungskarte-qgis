// Baut die statische Demo: Inhalt von demo/ (ohne Erzeugungsskript und Testdaten) nach dist/.
// Aufruf: node tools/bauen.cjs [zielordner]
const fs = require("node:fs"), path = require("node:path");
const quelle = path.resolve(__dirname, "../demo");
const ziel = path.resolve(process.argv[2] || path.join(__dirname, "../dist"));
const ausgenommen = new Set(["erzeugen.py", "aequivalenz.json", "__pycache__"]);
fs.rmSync(ziel, { recursive: true, force: true });
fs.mkdirSync(ziel, { recursive: true });
for (const name of fs.readdirSync(quelle)) {
  if (ausgenommen.has(name)) continue;
  fs.cpSync(path.join(quelle, name), path.join(ziel, name), { recursive: true });
}
fs.writeFileSync(path.join(ziel, ".nojekyll"), "");
console.log("Demo gebaut:", ziel);
