export interface TacticalAttackingZones {
  readonly left: number;
  readonly center: number;
  readonly right: number;
}

export interface TacticalPassTerritory {
  readonly ownHalfPasses: number;
  readonly oppHalfPasses: number;
  readonly ownHalfPct: number;
  readonly oppHalfPct: number;
}

export interface HeatmapPoint {
  readonly x: number;
  readonly y: number;
}

export interface TacticalSpatialData {
  readonly attackingZones?: TacticalAttackingZones;
  readonly passTerritory?: TacticalPassTerritory;
  readonly heatmapCirclesSvg?: string;
}

