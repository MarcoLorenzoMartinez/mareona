import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isIosDevice,
  resolveInstallPlatform,
  type InstallEnvironment,
} from "../../src/lib/pwa/install-platform.ts";
import {
  BANNER_DISMISS_MS,
  shouldShowInstallBanner,
} from "../../src/lib/pwa/install-banner.ts";
import {
  OFFLINE_PRECACHE_PATHS,
  isOfflineRoute,
} from "../../src/lib/pwa/offline-routes.ts";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const IPHONE_INSTAGRAM = `${IPHONE_SAFARI} Instagram 330.0.0.20.100`;
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const ANDROID_WEBVIEW = ANDROID_CHROME.replace("Mobile Safari", "Version/4.0 Mobile Safari; wv)");
const MAC_SAFARI =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";

const baseEnv: InstallEnvironment = {
  userAgent: ANDROID_CHROME,
  platform: "Linux armv8l",
  maxTouchPoints: 5,
  isStandalone: false,
  hasDeferredPrompt: false,
};

describe("PWA install platform detection", () => {
  it("never prompts when already running as an installed app", () => {
    const env = { ...baseEnv, isStandalone: true, hasDeferredPrompt: true };
    assert.equal(resolveInstallPlatform(env), "installed");
  });

  it("uses the native prompt when the browser provided one", () => {
    assert.equal(resolveInstallPlatform({ ...baseEnv, hasDeferredPrompt: true }), "native-prompt");
  });

  it("guides iPhone Safari users through the Share sheet", () => {
    const env = { ...baseEnv, userAgent: IPHONE_SAFARI, platform: "iPhone" };
    assert.equal(resolveInstallPlatform(env), "ios");
  });

  it("flags in-app browsers on iOS and Android as unable to install", () => {
    assert.equal(
      resolveInstallPlatform({ ...baseEnv, userAgent: IPHONE_INSTAGRAM, platform: "iPhone" }),
      "in-app"
    );
    assert.equal(resolveInstallPlatform({ ...baseEnv, userAgent: ANDROID_WEBVIEW }), "in-app");
  });

  it("falls back to manual instructions without a prompt", () => {
    assert.equal(resolveInstallPlatform(baseEnv), "manual");
  });

  it("distinguishes iPadOS (touch MacIntel) from a real Mac", () => {
    const ipad = { userAgent: MAC_SAFARI, platform: "MacIntel", maxTouchPoints: 5 };
    const mac = { userAgent: MAC_SAFARI, platform: "MacIntel", maxTouchPoints: 0 };
    assert.equal(isIosDevice(ipad), true);
    assert.equal(isIosDevice(mac), false);
  });
});

describe("Install banner policy", () => {
  const now = 1_700_000_000_000;
  const eligible = { platform: "native-prompt", pathname: "/temporada", visits: 2, dismissedAt: null, now };

  it("shows for a returning visitor with an install path", () => {
    assert.equal(shouldShowInstallBanner(eligible), true);
    assert.equal(shouldShowInstallBanner({ ...eligible, platform: "ios" }), true);
  });

  it("waits until the second visit so newcomers are not interrupted", () => {
    assert.equal(shouldShowInstallBanner({ ...eligible, visits: 1 }), false);
  });

  it("stays hidden for installed apps, webviews and unsupported browsers", () => {
    for (const platform of ["installed", "in-app", "manual", null]) {
      assert.equal(shouldShowInstallBanner({ ...eligible, platform }), false);
    }
  });

  it("does not duplicate the install page", () => {
    assert.equal(shouldShowInstallBanner({ ...eligible, pathname: "/instalar" }), false);
  });

  it("respects a dismissal for two weeks and then returns", () => {
    const recent = { ...eligible, dismissedAt: now - BANNER_DISMISS_MS + 1000 };
    const expired = { ...eligible, dismissedAt: now - BANNER_DISMISS_MS - 1000 };
    assert.equal(shouldShowInstallBanner(recent), false);
    assert.equal(shouldShowInstallBanner(expired), true);
  });
});

describe("Service worker precache list", () => {
  const swSource = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");

  it("stays in sync with the offline routes the app advertises", () => {
    for (const path of OFFLINE_PRECACHE_PATHS) {
      assert.ok(swSource.includes(`"${path}"`), `sw.js is missing precache path ${path}`);
    }
  });

  it("never caches live or personal routes", () => {
    for (const path of [
      "/juegos/porra",
      "/juegos/album",
      "/juegos/who-are-ya",
      "/social",
      "/perfil",
      "/temporada",
      "/api",
    ]) {
      assert.ok(!swSource.includes(`"${path}"`), `sw.js must not precache ${path}`);
    }
  });
});

describe("isOfflineRoute evaluation", () => {
  it("recognizes offline fallback and historical archive routes", () => {
    assert.equal(isOfflineRoute("/offline"), true);
    assert.equal(isOfflineRoute("/historico"), true);
    assert.equal(isOfflineRoute("/historico/efemerides"), true);
    assert.equal(isOfflineRoute("/historico/rivales/real-oviedo"), true);
  });

  it("recognizes daily offline games as offline-capable", () => {
    assert.equal(isOfflineRoute("/juegos"), true);
    assert.equal(isOfflineRoute("/juegos/wordle"), true);
    assert.equal(isOfflineRoute("/juegos/pregunta-del-dia"), true);
    assert.equal(isOfflineRoute("/juegos/mayor-menor"), true);
  });

  it("marks live network-dependent routes as requiring network", () => {
    assert.equal(isOfflineRoute("/"), false);
    assert.equal(isOfflineRoute("/temporada"), false);
    assert.equal(isOfflineRoute("/social"), false);
    assert.equal(isOfflineRoute("/perfil"), false);
    assert.equal(isOfflineRoute("/juegos/porra"), false);
    assert.equal(isOfflineRoute("/juegos/album"), false);
    assert.equal(isOfflineRoute("/juegos/who-are-ya"), false);
  });
});
