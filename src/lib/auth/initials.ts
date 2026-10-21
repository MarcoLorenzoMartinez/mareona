/**
 * Derives 2 clean uppercase initials from a user's display name, username, or email.
 * Conforms to the Sporting corporate identity: white initials over red background.
 *
 * @param identifier - Name, username, or email address (e.g. "Pelayo Álvarez", "pelayo.sporting@gmail.com")
 * @returns Exactly 2 uppercase alphanumeric characters (e.g. "PA", "PS", "QU")
 */
export function getAvatarInitials(identifier: string | null | undefined): string {
  if (!identifier || typeof identifier !== "string") {
    return "RS";
  }

  const clean = identifier.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!clean) return "RS";

  // Case 1: Email address
  if (clean.includes("@")) {
    const localPart = clean.split("@")[0]?.split("+")[0] ?? "";
    const parts = localPart.split(/[^a-zA-Z0-9]/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    const letters = localPart.replace(/[^a-zA-Z0-9]/g, "");
    if (letters.length >= 2) {
      return letters.slice(0, 2).toUpperCase();
    }
    if (letters.length === 1) {
      return `${letters}S`.toUpperCase();
    }
    return "RS";
  }

  // Case 2: Display name or username with multiple words / tokens
  const tokens = clean.split(/[^a-zA-Z0-9]/).filter(Boolean);
  if (tokens.length >= 2 && tokens[0] && tokens[1]) {
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  }

  // Case 3: Single word token
  const letters = clean.replace(/[^a-zA-Z0-9]/g, "");
  if (letters.length >= 2) {
    return letters.slice(0, 2).toUpperCase();
  }
  if (letters.length === 1) {
    return `${letters}S`.toUpperCase();
  }

  return "RS";
}
