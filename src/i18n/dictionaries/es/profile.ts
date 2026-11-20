/**
 * Spanish profile and account management dictionary entries.
 */
export const esProfile = {
  metadata: {
    title: "Mi Perfil",
  },
  guest: {
    title: "Tu perfil",
    signInButton: "Iniciar sesión",
    signUpButton: "Crear cuenta",
  },
  header: {
    currentSeasonFallback: "temporada actual",
    editButton: "Editar perfil",
    signOutButton: "Cerrar sesión",
    sincePrefix: "Desde",
  },
  avatarPicker: {
    invalidFileFallback: "Archivo no válido",
    uploadErrorFallback: "No se pudo subir la foto",
    unexpectedError: "Error inesperado al subir la foto",
    fileInputAria: "Seleccionar foto de perfil desde galería o cámara",
    changePhotoAria: "Cambiar foto de perfil",
    uploadPhotoAria: "Subir foto de perfil",
    removePhotoButton: "Quitar foto",
  },
  editForm: {
    updateErrorFallback: "No se pudo actualizar el perfil",
    displayNameLabel: "Nombre visible",
    displayNamePlaceholder: "Ej. Pelayo Álvarez",
    usernameLabel: "Apodo de usuario",
    usernamePlaceholder: "pelayo_rsg",
    usernameTitle: "De 3 a 20 caracteres (letras, números y guión bajo)",
    deleteAccountLink: "Eliminar mi cuenta y mis datos",
    cancelButton: "Cancelar",
    saving: "Guardando...",
    saveButton: "Guardar cambios",
  },
  posts: {
    sectionAria: "Mis publicaciones",
    title: "Publicaciones",
    filterAria: "Filtrar publicaciones por origen",
    originTabs: {
      all: "Todas",
      social: "Social",
      grada: "Grada",
    },
    loading: "Cargando publicaciones...",
    emptySocial: "Aún no has publicado en Social",
    emptyGrada: "Aún no has publicado en Grada",
    emptyAll: "Aún no has publicado en la tertulia",
    deleteErrorFallback: "No se pudo borrar la publicación",
    deleteSuccess: "Publicación eliminada",
  },
  deleteDialog: {
    errorFallback: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
    successToast: "Tu cuenta y datos personales han sido eliminados.",
    title: "¿Eliminar tu cuenta y datos?",
    descriptionPrefix: "Esta acción es",
    descriptionHighlight: "definitiva e irreversible",
    descriptionSuffix:
      ". Conforme a tu derecho al olvido (RGPD), se suprimirán inmediatamente tus datos de acceso, apodo, pronósticos de la porra, participaciones en juegos y comentarios en la tertulia.",
    warningBox:
      "No podrás recuperar tus puntos acumulados ni tu historial sportinguista una vez confirmada la eliminación.",
    cancelButton: "Cancelar",
    deleting: "Eliminando...",
    confirmButton: "Sí, eliminar definitivamente",
  },
} as const;
