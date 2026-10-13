import {
  CalendarDays,
  Gamepad2,
  History,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Temporada",
    href: "/temporada",
    icon: CalendarDays,
    description: "Partidos, clasificación y plantilla actual",
  },
  {
    label: "Histórico",
    href: "/historico",
    icon: History,
    description: "Archivo histórico y efemérides sportinguistas",
  },
  {
    label: "Social",
    href: "/social",
    icon: MessageSquare,
    description: "Comunidad, feed de partidos y debates",
  },
  {
    label: "Juegos",
    href: "/juegos",
    icon: Gamepad2,
    description: "La Porra de El Molinón y pasatiempos",
  },
];
