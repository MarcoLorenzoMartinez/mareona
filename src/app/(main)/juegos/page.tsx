import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Juegos',
  description: 'Pasatiempos y retos diarios del Real Sporting de Gijón.',
};

interface GameCardItem {
  id: string;
  title: string;
  tag: string;
  href: string;
  isAvailable: boolean;
  statusLabel?: string;
}

const GAMES: GameCardItem[] = [
  {
    id: 'album',
    title: 'Memoria Rojiblanca',
    tag: 'Colección',
    href: '/juegos/album',
    isAvailable: true,
  },
  {
    id: 'porra',
    title: 'La Porra de la Mareona',
    tag: 'Jornada',
    href: '/juegos/porra',
    isAvailable: true,
  },
  {
    id: 'wordle',
    title: 'Wordle',
    tag: 'Diario',
    href: '/juegos/wordle',
    isAvailable: true,
  },
  {
    id: 'pregunta-del-dia',
    title: 'La Pregunta del Día',
    tag: 'Diario',
    href: '/juegos/pregunta-del-dia',
    isAvailable: true,
  },
  {
    id: 'quien-es',
    title: '¿Quién es?',
    tag: 'Diario',
    href: '/juegos/who-are-ya',
    isAvailable: true,
  },
  {
    id: 'mayor-menor',
    title: '¿Mayor o Menor?',
    tag: 'Récord',
    href: '/juegos/mayor-menor',
    isAvailable: true,
  },
];

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Juegos y Pasatiempos</h1>

      <section
        aria-label="Zona de juegos"
        className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a] hover:shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {game.tag}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-neutral-400 group-hover:border-[#e2001a] group-hover:bg-[#e2001a] group-hover:text-white transition-all">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] group-hover:text-[#e2001a] transition-colors">
                {game.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
