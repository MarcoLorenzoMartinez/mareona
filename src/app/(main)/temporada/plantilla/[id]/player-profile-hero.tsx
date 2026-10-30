import Link from "next/link";
import type { DomainPlayer } from "@/lib/sports-api/types";
import type { DomainPlayerProfile } from "@/lib/sports-api/fotmob-player-profile-types";
import { PlayerPhoto } from "@/components/media/player-photo";
import { PlayerAvatarFallback } from "@/components/media/player-avatar-fallback";
import { translateCountryName } from "@/lib/sports-api/fotmob-player-stats-translations";
import { getDictionary } from "@/i18n";

interface PlayerProfileHeroProps {
  readonly player: DomainPlayer;
  readonly profile: DomainPlayerProfile | null;
}

export function PlayerProfileHero({ player, profile }: PlayerProfileHeroProps) {
  const dict = getDictionary();
  const bio = profile?.biometrics;
  const dorsal = player.shirtNumber ?? profile?.shirtNumber;
  const countryName = bio?.country ?? (player.nationality ? translateCountryName(player.nationality) : null);

  return (
    <header className="flex flex-col gap-6">
      {/* Enlace de retorno sobrio a la plantilla */}
      <nav aria-label="Navegación de retorno" className="-mt-1">
        <Link
          href="/temporada/plantilla"
          className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md"
        >
          ← {dict.season.squad.backToSquad}
        </Link>
      </nav>

      {/* Tarjeta Hero Principal del Jugador */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-7 shadow-xs">
        {/* Dorsal gigante semitransparente de fondo */}
        {dorsal !== null && dorsal !== undefined && (
          <div
            aria-hidden="true"
            className="absolute -top-4 right-3 sm:right-6 pointer-events-none select-none z-0"
          >
            <span className="text-8xl sm:text-9xl font-black text-[var(--primary)] opacity-20 tabular-nums tracking-tighter leading-none">
              {dorsal}
            </span>
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
          {/* Foto de busto recortada o avatar */}
          <div className="relative h-44 w-44 sm:h-52 sm:w-52 shrink-0 flex items-end justify-center rounded-2xl bg-gradient-to-b from-neutral-50 to-neutral-100 border border-neutral-200/70 p-2 overflow-hidden shadow-2xs">
            {player.photoUrl ? (
              <PlayerPhoto
                photoUrl={player.photoUrl}
                playerName={player.displayName}
                shirtNumber={dorsal ?? null}
                size="lg"
                className="h-full w-full object-contain object-bottom"
              />
            ) : (
              <PlayerAvatarFallback teamColor="#e2001a" className="h-28 w-28" />
            )}
          </div>

          {/* Datos de identidad y club */}
          <div className="flex flex-1 flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex flex-wrap items-baseline gap-2.5 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {player.displayName}
              </h1>
            </div>

            {/* Píldoras con datos biométricos */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
              {bio?.preferredFoot && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">Pie:</span>
                  <span className="font-bold text-neutral-900">{bio.preferredFoot}</span>
                </div>
              )}

              {bio?.height && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">Altura:</span>
                  <span className="font-bold text-neutral-900 tabular-nums">{bio.height}</span>
                </div>
              )}

              {bio?.age && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">Edad:</span>
                  <span className="font-bold text-neutral-900 tabular-nums">{bio.age} años</span>
                </div>
              )}

              {countryName && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">País:</span>
                  <span className="font-bold text-neutral-900">{countryName}</span>
                </div>
              )}

              {bio?.marketValue && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">Valor:</span>
                  <span className="font-bold text-neutral-900 tabular-nums">{bio.marketValue}</span>
                </div>
              )}

              {bio?.contractEnd && (
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                  <span className="text-neutral-600 font-bold">Contrato:</span>
                  <span className="font-bold text-neutral-900 tabular-nums">{bio.contractEnd}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
