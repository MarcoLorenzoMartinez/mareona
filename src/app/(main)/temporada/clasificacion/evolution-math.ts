import type { MatchdayEvolutionPoint } from "@/lib/sports-api/types";

export const CHART_DIMENSIONS = {
  width: 660,
  height: 270,
  paddingLeft: 52,
  paddingRight: 52,
  paddingTop: 35,
  paddingBottom: 40,
} as const;

export interface ChartGeometry {
  readonly width: number;
  readonly height: number;
  readonly plotWidth: number;
  readonly plotHeight: number;
  readonly maxYPoints: number;
  readonly getX: (index: number) => number;
  readonly getYPoints: (pts: number) => number;
  readonly getYPosition: (pos: number) => number;
  readonly pointsCoords: readonly { x: number; y: number }[];
  readonly positionCoords: readonly { x: number; y: number }[];
  readonly pointsLinePath: string;
  readonly positionLinePath: string;
  readonly pointsAreaPath: string;
}

/**
 * Computes SVG viewport coordinates, scaling functions, and line/area path strings
 * for the dual-axis points and ranking evolution chart.
 *
 * @param evolution - Array of chronological matchday evolution data points.
 * @returns Precomputed layout metrics and SVG path descriptors.
 */
export function computeChartGeometry(
  evolution: readonly MatchdayEvolutionPoint[]
): ChartGeometry {
  const { width, height, paddingLeft, paddingRight, paddingTop, paddingBottom } =
    CHART_DIMENSIONS;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxCumulativePoints = Math.max(
    ...evolution.map((p) => p.cumulativePoints),
    18
  );
  // Round up to multiple of 5 for uniform tick intervals
  const maxYPoints = Math.ceil(maxCumulativePoints / 5) * 5;

  const getX = (index: number): number => {
    if (evolution.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (evolution.length - 1)) * plotWidth;
  };

  const getYPoints = (pts: number): number => {
    return paddingTop + plotHeight - (pts / maxYPoints) * plotHeight;
  };

  const getYPosition = (pos: number): number => {
    const clamped = Math.max(1, Math.min(22, pos));
    return paddingTop + ((clamped - 1) / 21) * plotHeight;
  };

  const pointsCoords = evolution.map((p, i) => ({
    x: getX(i),
    y: getYPoints(p.cumulativePoints),
  }));

  const positionCoords = evolution.map((p, i) => ({
    x: getX(i),
    y: getYPosition(p.position),
  }));

  const pointsLinePath = pointsCoords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ");

  const positionLinePath = positionCoords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ");

  const firstPointCoord = pointsCoords[0];
  const lastPointCoord = pointsCoords[pointsCoords.length - 1];
  const pointsAreaPath =
    firstPointCoord && lastPointCoord
      ? `${pointsLinePath} L ${lastPointCoord.x} ${
          paddingTop + plotHeight
        } L ${firstPointCoord.x} ${paddingTop + plotHeight} Z`
      : "";

  return {
    width,
    height,
    plotWidth,
    plotHeight,
    maxYPoints,
    getX,
    getYPoints,
    getYPosition,
    pointsCoords,
    positionCoords,
    pointsLinePath,
    positionLinePath,
    pointsAreaPath,
  };
}
