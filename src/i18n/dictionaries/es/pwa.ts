/**
 * Spanish PWA install, offline banner, and sync notification dictionary entries.
 */
export const esPwa = {
  installBanner: {
    aria: "Instalar Mareona",
    title: "Mareona en tu móvil",
    subtitle: "Acceso directo y juegos sin conexión",
    installButton: "Instalar",
    dismissAria: "Ocultar aviso de instalación",
  },
  installGuide: {
    title: "Instalar Mareona",
    confirmButton: "Entendido",
    shareAria: "Compartir",
    iosStep1Prefix: "Toca el botón Compartir",
    iosStep1Suffix: "de Safari.",
    iosStep2: "Elige «Añadir a pantalla de inicio».",
    iosStep3: "Pulsa «Añadir».",
    inAppStep1: "Abre el menú de esta ventana (⋯ o ⋮).",
    inAppStep2: "Elige «Abrir en el navegador».",
    inAppStep3: "Instala Mareona desde Safari o Chrome.",
    manualStep1: "Abre el menú de tu navegador.",
    manualStep2: "Elige «Instalar app» o «Añadir a pantalla de inicio».",
  },
  installPanel: {
    appName: "Mareona",
    alreadyInstalled: "Ya tienes Mareona instalada en este dispositivo.",
    installButton: "Instalar app",
  },
  offlineBanner: {
    reconnectedToast: "Conexión recuperada",
    statusText: "Sin conexión - Juegos y archivo histórico disponibles",
    degradedText: "Cobertura débil - Algunas acciones pueden tardar",
  },
  offlineSync: {
    oneSyncedTitle: "Partida sin conexión sincronizada",
    manySyncedSuffix: "partidas sincronizadas",
    syncedDescription:
      "Tus progresos jugados sin cobertura se han guardado con éxito.",
  },
} as const;
