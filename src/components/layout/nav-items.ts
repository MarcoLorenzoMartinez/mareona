import {
  Home,
  CalendarDays,
  Gamepad2,
  History,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/i18n";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
}

const dict = getDictionary();

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: dict.layout.nav.items.home.label,
    href: "/",
    icon: Home,
    description: dict.layout.nav.items.home.description,
  },
  {
    label: dict.layout.nav.items.season.label,
    href: "/temporada",
    icon: CalendarDays,
    description: dict.layout.nav.items.season.description,
  },
  {
    label: dict.layout.nav.items.history.label,
    href: "/historico",
    icon: History,
    description: dict.layout.nav.items.history.description,
  },
  {
    label: dict.layout.nav.items.social.label,
    href: "/social",
    icon: MessageSquare,
    description: dict.layout.nav.items.social.description,
  },
  {
    label: dict.layout.nav.items.games.label,
    href: "/juegos",
    icon: Gamepad2,
    description: dict.layout.nav.items.games.description,
  },
];

