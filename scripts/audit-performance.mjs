import http from "node:http";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const TARGET_PORT = 3000;
const BASE_URL = `http://localhost:${TARGET_PORT}`;

// High-impact pages covering all architectural modes of Mareona
const DEFAULT_ROUTES = [
  { path: "/", name: "Portada" },
  { path: "/temporada", name: "Partidos" },
  { path: "/temporada/clasificacion", name: "Clasificación" },
  { path: "/temporada/plantilla", name: "Plantilla" },
  { path: "/juegos/porra", name: "La Porra" },
  { path: "/juegos/wordle", name: "Wordle Sportinguista" },
  { path: "/social", name: "Muro Social" },
  { path: "/historico", name: "Archivo Histórico" },
  { path: "/instalar", name: "Instalación PWA" },
  { path: "/aviso-legal", name: "Aviso Legal" },
];

/**
 * Checks if the Next.js server is already running on the target port.
 */
function isServerRunning(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Waits until the server responds with a valid HTTP status.
 */
async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isServerRunning(port)) return true;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function runAudit() {
  console.log("🚀 Iniciando Auditoría de Rendimiento & Core Web Vitals (Lighthouse)...");

  let serverProcess = null;
  const alreadyRunning = await isServerRunning(TARGET_PORT);

  if (!alreadyRunning) {
    console.log(`📡 Servidor no detectado. Arrancando servidor de producción 'next start' en puerto ${TARGET_PORT}...`);
    serverProcess = spawn("npx", ["next", "start", "-p", String(TARGET_PORT)], {
      stdio: "pipe",
      shell: true,
    });

    const isUp = await waitForServer(TARGET_PORT);
    if (!isUp) {
      console.error("❌ No se pudo conectar con el servidor Next.js en el puerto " + TARGET_PORT);
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  }

  console.log(`✅ Servidor disponible en ${BASE_URL}. Lanzando navegador Chromium headless...`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
  });

  const results = [];

  try {
    for (const route of DEFAULT_ROUTES) {
      const targetUrl = `${BASE_URL}${route.path}`;
      process.stdout.write(`⏳ Evaluando [${route.name}] (${route.path})... `);

      const runnerResult = await lighthouse(targetUrl, {
        port: chrome.port,
        output: "json",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        logLevel: "error",
      });

      const report = runnerResult.lhr;
      const categories = report.categories;

      const perfScore = Math.round((categories.performance?.score || 0) * 100);
      const a11yScore = Math.round((categories.accessibility?.score || 0) * 100);
      const bpScore = Math.round((categories["best-practices"]?.score || 0) * 100);
      const seoScore = Math.round((categories.seo?.score || 0) * 100);

      const lcp = report.audits["largest-contentful-paint"]?.displayValue || "N/A";
      const cls = report.audits["cumulative-layout-shift"]?.displayValue || "N/A";
      const fcp = report.audits["first-contentful-paint"]?.displayValue || "N/A";

      results.push({
        path: route.path,
        name: route.name,
        performance: perfScore,
        accessibility: a11yScore,
        bestPractices: bpScore,
        seo: seoScore,
        lcp,
        cls,
        fcp,
      });

      console.log(`✅ P:${perfScore} | A:${a11yScore} | BP:${bpScore} | SEO:${seoScore} (LCP: ${lcp})`);
    }
  } finally {
    await chrome.kill();
    if (serverProcess && serverProcess.pid) {
      if (process.platform === "win32") {
        try {
          execSync(`taskkill /PID ${serverProcess.pid} /T /F`, { stdio: "ignore" });
        } catch {
          serverProcess.kill();
        }
      } else {
        serverProcess.kill();
      }
    }
  }

  // Generate Report Markdown
  const reportDir = path.resolve(process.cwd(), ".lighthouseci");
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  let table = "\n### Resultados Oficiales de la Auditoría de Rendimiento (Lighthouse)\n\n";
  table += "| Pantalla | Ruta | Performance | Accesibilidad | Buenas Prácticas | SEO | LCP | CLS |\n";
  table += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";

  for (const r of results) {
    table += `| **${r.name}** | \`${r.path}\` | **${r.performance}** | **${r.accessibility}** | **${r.bestPractices}** | **${r.seo}** | ${r.lcp} | ${r.cls} |\n`;
  }

  fs.writeFileSync(path.join(reportDir, "summary.md"), table, "utf-8");
  fs.writeFileSync(path.join(reportDir, "results.json"), JSON.stringify(results, null, 2), "utf-8");

  console.log("\n" + table);
  console.log(`📄 Informe detallado guardado en: .lighthouseci/summary.md`);
}

runAudit().catch((err) => {
  console.error("❌ Error en la auditoría:", err);
  process.exit(1);
});
