# Inventario de Activos Visuales y Licencias (`docs/assets-licenses.md`)

Complementa a [`docs/LEGAL-ASSETS.md`](LEGAL-ASSETS.md) con el inventario técnico de orígenes y controles de retirada.

## 1. Activos propios de Mareona
- `public/logo.png`, `public/icons/*`, `src/app/opengraph-image.tsx`, `src/app/icon.*`: identidad visual propia de Mareona.
- `public/avatars/presets/*.svg`: avatares predefinidos propios de Mareona.

## 2. Activos de terceros (uso informativo, sujetos a killswitch)
Todos los activos oficiales o de terceros están protegidos por la variable `NEXT_PUBLIC_SHOW_OFFICIAL_ASSETS` (`src/lib/legal/official-assets.ts`). Si se establece en `"false"`, la aplicación los sustituye automáticamente por placeholders neutros sin necesidad de cambios de código:

1. **Escudos de clubes** (`<TeamCrest>` en `src/components/media/team-crest.tsx`, `HistoricalCrestBadge` y lienzo de exportación): origen ESPN / FotMob / BDFutbol mediante `next/image` o URLs autorizadas.
2. **Fotografías de jugadores** (`<PlayerPhoto>` en `src/components/media/player-photo.tsx`, tarjetas tácticas, álbum `HistoricalCard`, `SafePlayerAvatar`, juegos diarios): origen FotMob / BDFutbol.
3. **Fotografías de estadios** (`public/stadiums/*.jpg|png` vía `getStadiumAsset` en `src/lib/sports-api/stadiums.ts` y fondos de arena en juegos): protegidas por `areOfficialAssetsEnabled()` en los 6 renderizadores de estadio (`NextFixtureHero`, `MatchHeader`, `MatchScoreboard`, `CardStadiumBackground`, `HigherLowerArenaBackground`, `TriviaArenaBackground`).

## 3. Solicitud de retirada
Cualquier titular de derechos puede solicitar la retirada inmediata (máximo 48 horas) escribiendo a `marcolorenzomart@gmail.com`.
