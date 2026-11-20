/**
 * Spanish authentication and onboarding dictionary entries.
 */
export const esAuth = {
  common: {
    defaultFanName: "Aficionado",
  },
  modal: {
    dialogAria: "Acceso a Mareona",
    cancelRegistrationAria: "Cancelar registro y salir",
    closeAria: "Cerrar ventana",
  },
  credentials: {
    signInErrorFallback: "No se pudo iniciar sesión",
    signUpErrorFallback: "No se pudo registrar la cuenta",
    emailConfirmedBanner:
      "Correo confirmado. Inicia sesión con tu contraseña para continuar.",
    modeTabsAria: "Modo de acceso",
    signInTab: "Iniciar sesión",
    signUpTab: "Crear cuenta",
    orWithEmail: "o con tu correo",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "aficionado@ejemplo.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Mínimo 6 caracteres",
    hidePasswordAria: "Ocultar contraseña",
    showPasswordAria: "Ver contraseña",
    signInSubmit: "Entrar",
    signUpSubmit: "Crear mi cuenta",
  },
  confirmation: {
    resentSuccess: "Correo enviado de nuevo",
    resentErrorFallback: "No se pudo reenviar el correo",
    title: "Confirma tu correo",
    sentToPrefix: "Te hemos enviado un enlace de activación a",
    spamHint:
      "Ábrelo para activar tu cuenta. Si no aparece en unos segundos, revisa la carpeta de spam.",
    resending: "Reenviando...",
    resendButton: "Reenviar correo",
    backButton: "Volver",
  },
  onboarding: {
    updateErrorFallback: "No se pudo actualizar el perfil",
    title: "Elige tu nombre y usuario",
    subtitle: "Puedes personalizar tus datos o dejar los valores sugeridos.",
    displayNameLabel: "Tu nombre en Mareona",
    displayNamePlaceholder: "ej. Pelayo García",
    usernameLabel: "Tu apodo (@usuario)",
    usernamePlaceholder: "pelayo_1905",
    usernameTitle: "De 3 a 20 caracteres (letras, números y guión bajo)",
    cancelButton: "Cancelar y salir",
    saving: "Guardando...",
    startButton: "Comenzar",
  },
  userNav: {
    offlineSignInNotice: "Iniciar sesión necesita internet.",
    signInAria: "Iniciar sesión o unirme a Mareona",
    signInLabel: "Entrar",
    openMenuAria: "Abrir menú de usuario",
    menuAria: "Opciones de cuenta",
    adminLink: "Administración",
    profileLink: "Mi Perfil",
    signOutButton: "Cerrar sesión",
  },
  google: {
    connectError: "No se pudo conectar con Google en este momento.",
    continueWithGoogle: "Continuar con Google",
  },
} as const;
