import test from "node:test";
import assert from "node:assert/strict";
import { getStadiumAsset } from "../../src/lib/sports-api/stadiums.ts";

test("getStadiumAsset returns El Molinón asset when isSporting is true", () => {
  const asset = getStadiumAsset({ isSporting: true });
  assert.ok(asset);
  assert.equal(asset.imagePath, "/stadiums/el-molinon.jpg");
  assert.match(asset.canonicalName, /El Molinón/);
});

test("getStadiumAsset returns El Molinón asset by Sporting team external ID", () => {
  const asset = getStadiumAsset({ teamExternalId: "3788" });
  assert.ok(asset);
  assert.equal(asset.imagePath, "/stadiums/el-molinon.jpg");
});

test("getStadiumAsset resolves Carlos Tartiere for Real Oviedo", () => {
  const assetById = getStadiumAsset({ teamExternalId: "92" });
  assert.ok(assetById);
  assert.equal(assetById.imagePath, "/stadiums/carlos-tartiere.jpg");
  assert.equal(assetById.canonicalName, "Estadio Carlos Tartiere");

  const assetByVenue = getStadiumAsset({ venueName: "Estadio Carlos Tartiere" });
  assert.ok(assetByVenue);
  assert.equal(assetByVenue.imagePath, "/stadiums/carlos-tartiere.jpg");
});

test("getStadiumAsset resolves Nuevo Mirandilla for Cádiz", () => {
  const assetById = getStadiumAsset({ teamExternalId: "3842" });
  assert.ok(assetById);
  assert.equal(assetById.imagePath, "/stadiums/nuevo-mirandilla.jpg");
  assert.equal(assetById.canonicalName, "Estadio Nuevo Mirandilla");
});

test("getStadiumAsset resolves Carlos Belmonte for Albacete", () => {
  const assetById = getStadiumAsset({ teamExternalId: "2737" });
  assert.ok(assetById);
  assert.equal(assetById.imagePath, "/stadiums/carlos-belmonte.png");
});

test("getStadiumAsset resolves stadium by teamName keyword", () => {
  const assetByTeamName = getStadiumAsset({ teamName: "Castellón" });
  assert.ok(assetByTeamName);
  assert.equal(assetByTeamName.imagePath, "/stadiums/castalia.jpg");
  assert.equal(assetByTeamName.canonicalName, "Nou Estadi Castàlia");

  const assetByAlbacete = getStadiumAsset({ teamName: "Albacete Balompié" });
  assert.ok(assetByAlbacete);
  assert.equal(assetByAlbacete.imagePath, "/stadiums/carlos-belmonte.png");
});

test("getStadiumAsset returns null for unknown away stadiums (zero fake data policy)", () => {
  const asset = getStadiumAsset({ teamExternalId: "unknown-9999", venueName: "Estadio Ficticio", teamName: "Equipo Desconocido" });
  assert.equal(asset, null);
});

test("getStadiumAsset returns null when no query information is provided", () => {
  const asset = getStadiumAsset({});
  assert.equal(asset, null);
});
