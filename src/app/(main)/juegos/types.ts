export interface GameItem {
  readonly id: "album" | "porra" | "wordle" | "pregunta-del-dia" | "quien-es" | "mas-o-menos";
  readonly title: string;
  readonly tag: string;
  readonly href: string;
}

export const GAMES: readonly GameItem[] = [
  {
    id: "album",
    title: "Memoria Rojiblanca",
    tag: "Colección",
    href: "/juegos/album",
  },
  {
    id: "porra",
    title: "La Porra de la Mareona",
    tag: "Jornada",
    href: "/juegos/porra",
  },
  {
    id: "wordle",
    title: "Wordle",
    tag: "Diario",
    href: "/juegos/wordle",
  },
  {
    id: "pregunta-del-dia",
    title: "La Pregunta del Día",
    tag: "Diario",
    href: "/juegos/pregunta-del-dia",
  },
  {
    id: "quien-es",
    title: "¿Quién es?",
    tag: "Diario",
    href: "/juegos/quien-es",
  },
  {
    id: "mas-o-menos",
    title: "¿Más o Menos?",
    tag: "Récord",
    href: "/juegos/mas-o-menos",
  },
];
