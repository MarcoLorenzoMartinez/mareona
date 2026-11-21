/**
 * Spanish global layout, navigation, footer, offline, and install dictionary entries.
 */
export const esLayout = {
  brand: {
    name: "Mareona",
    club: "Real Sporting",
    homeAria: "Mareona — Inicio",
    logoAlt: "Mareona Logo",
  },
  nav: {
    desktopAria: "Navegación principal",
    mobileAria: "Navegación móvil",
    notificationsAriaSuffix: "notificaciones en Social",
    items: {
      home: {
        label: "Inicio",
        description: "Portada y resumen de actualidad sportinguista",
      },
      season: {
        label: "Temporada",
        description: "Partidos, clasificación y plantilla actual",
      },
      history: {
        label: "Histórico",
        description: "Archivo histórico y efemérides sportinguistas",
      },
      social: {
        label: "Social",
        description: "Comunidad, feed de partidos y debates",
      },
      games: {
        label: "Juegos",
        description: "La Porra de El Molinón y pasatiempos",
      },
    },
  },
  announcement: {
    info: "Información",
    warning: "Atención",
    alert: "Aviso Urgente",
  },
  footer: {
    navAria: "Información legal",
    about: "Acerca de",
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    terms: "Términos",
    cookies: "Cookies",
    contact: "Contacto",
    installApp: "Instalar app",
    disclaimer:
      "Mareona. Proyecto independiente creado por aficionados, sin patrocinio, respaldo ni vinculación oficial con el Real Sporting de Gijón, S.A.D. ni con LaLiga.",
  },
  offline: {
    title: "Sin conexión",
    description:
      "No tienes conexión, mientras tanto puedes visitar las siguientes secciones:",
    historySection: "Histórico",
    gamesSection: "Juegos",
  },
  install: {
    metadataTitle: "Instalar la app",
    metadataDescription:
      "Instala Mareona en tu móvil: acceso directo, pantalla completa y juegos sin conexión.",
    title: "Instalar Mareona",
    benefits: [
      "Acceso directo desde la pantalla de inicio",
      "Pantalla completa, sin barra del navegador",
      "Juegos y archivo histórico sin conexión",
    ] as const,
  },
} as const;
