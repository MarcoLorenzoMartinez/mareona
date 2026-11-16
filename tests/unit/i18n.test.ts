import test from "node:test";
import assert from "node:assert/strict";
import { getDictionary, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../../src/i18n/index.ts";

test("getDictionary returns complete Spanish dictionary by default", () => {
  const dict = getDictionary();
  assert.ok(dict);
  assert.equal(typeof dict.common.noData, "string");
  assert.equal(typeof dict.season.tabs.overview, "string");
  assert.equal(dict.season.tabs.overview, "Resumen");
  assert.equal(dict.season.tabs.matches, "Partidos");
  assert.equal(dict.season.tabs.standings, "Clasificación");
  assert.equal(dict.season.tabs.squad, "Plantilla");
});

test("DEFAULT_LOCALE is 'es' and is included in SUPPORTED_LOCALES", () => {
  assert.equal(DEFAULT_LOCALE, "es");
  assert.ok(SUPPORTED_LOCALES.includes("es"));
});

test("getDictionary returns required standings and match translations", () => {
  const dict = getDictionary("es");
  assert.equal(dict.season.match.nextFixture, "Próximo Encuentro");
  assert.equal(dict.season.match.vs, "vs");
  assert.equal(dict.season.standings.title, "Clasificación");
  assert.equal(dict.season.standings.views.table, "Tabla");
  assert.equal(dict.season.standings.views.distance, "Distancia Real");
  assert.equal(dict.season.standings.scopes.total, "General");
  assert.equal(dict.season.standings.scopes.home, "En Casa");
  assert.equal(dict.season.standings.scopes.away, "A Domicilio");
  assert.equal(dict.season.standings.zones.promotion, "Ascenso directo");
  assert.equal(dict.season.standings.zones.playoff, "Playoff");
  assert.equal(dict.season.standings.zones.relegation, "Descenso");
});

test("getDictionary returns required historico translations and tabs", () => {
  const dict = getDictionary("es");
  assert.ok(dict.historico);
  assert.equal(dict.historico.title, "Histórico — Mareona");
  assert.equal(dict.historico.tabs.trajectory, "Trayectoria");
  assert.equal(dict.historico.tabs.ephemerides, "Efemérides");
  assert.equal(dict.historico.tabs.rivals, "Rivales");
  assert.equal(dict.historico.tabs.legacy, "Legado");
});

