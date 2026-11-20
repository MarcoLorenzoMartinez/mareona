import { getDictionary } from "@/i18n";

export interface GameItem {
  readonly id: "album" | "porra" | "wordle" | "pregunta-del-dia" | "quien-es" | "mas-o-menos";
  readonly title: string;
  readonly tag: string;
  readonly href: string;
}

const dict = getDictionary();

export const GAMES: readonly GameItem[] = [
  {
    id: "album",
    title: dict.games.hub.items.album.title,
    tag: dict.games.hub.items.album.tag,
    href: "/juegos/album",
  },
  {
    id: "porra",
    title: dict.games.hub.items.porra.title,
    tag: dict.games.hub.items.porra.tag,
    href: "/juegos/porra",
  },
  {
    id: "wordle",
    title: dict.games.hub.items.wordle.title,
    tag: dict.games.hub.items.wordle.tag,
    href: "/juegos/wordle",
  },
  {
    id: "pregunta-del-dia",
    title: dict.games.hub.items["pregunta-del-dia"].title,
    tag: dict.games.hub.items["pregunta-del-dia"].tag,
    href: "/juegos/pregunta-del-dia",
  },
  {
    id: "quien-es",
    title: dict.games.hub.items["quien-es"].title,
    tag: dict.games.hub.items["quien-es"].tag,
    href: "/juegos/quien-es",
  },
  {
    id: "mas-o-menos",
    title: dict.games.hub.items["mas-o-menos"].title,
    tag: dict.games.hub.items["mas-o-menos"].tag,
    href: "/juegos/mas-o-menos",
  },
];
