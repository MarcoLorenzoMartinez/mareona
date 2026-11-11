import { exportLineupToBlob } from "./export-canvas";
import type { PitchAssignedPlayer } from "./types";

/**
 * Generates and downloads the tactical lineup canvas as a high-resolution PNG file.
 */
export async function downloadLineupPng(
  formationKey: string,
  starters: readonly PitchAssignedPlayer[]
): Promise<void> {
  const blob = await exportLineupToBlob({
    formationLabel: formationKey,
    teamTitle: "Real Sporting",
    starters,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `once-real-sporting-${formationKey.toLowerCase()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
