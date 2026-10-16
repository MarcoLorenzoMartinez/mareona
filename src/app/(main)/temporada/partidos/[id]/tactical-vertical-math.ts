/**
 * Pure coordinate mapping from FotMob normalized vertical layout coordinates
 * (x: 0..1 lateral, y: 0..1 longitudinal) to CSS percentage coordinates on a
 * vertical football pitch with the team defending bottom and attacking upwards.
 *
 * @param x - Normalized lateral position (FotMob: ~0.85 left flank, ~0.15 right flank)
 * @param y - Normalized longitudinal position (FotMob: ~0.1 goalkeeper, ~0.85 striker)
 * @returns { pitchX, pitchY } percentages bounded safely inside the field margins
 */
export function calculateVerticalPitchCoordinates(
  x: number,
  y: number
): { readonly pitchX: number; readonly pitchY: number } {
  // Clamping inputs to safe 0..1 range
  const safeX = Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0.5));
  const safeY = Math.max(0, Math.min(1, Number.isFinite(y) ? y : 0.5));

  // Lateral axis: FotMob x ~ 0.85 is left flank (lateral/extremo izq), x ~ 0.15 is right flank.
  // On our vertical pitch (looking from bottom goal up): left flank is on the screen left (~16-24%),
  // center is at 50%, right flank is on screen right (~76-84%).
  const pitchX = Math.max(14, Math.min(86, 14 + (1 - safeX) * 72));

  // Longitudinal axis: FotMob y ~ 0.1 is goalkeeper (bottom goal), y ~ 0.85 is striker (top goal).
  // On our vertical pitch: goalkeeper sits at ~82-86%, center backs ~68-72%, midfielders ~45-55%, strikers ~18-24%.
  const pitchY = Math.max(14, Math.min(88, 14 + (1 - safeY) * 72));

  return { pitchX, pitchY };
}
