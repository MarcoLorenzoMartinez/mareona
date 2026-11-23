import type { HistoricalChartPoint } from "@/lib/historical/types";

export const CHART_WIDTH = 920;
export const CHART_HEIGHT = 220;
export const CHART_PAD_LEFT = 42;
export const CHART_PAD_RIGHT = 24;
export const CHART_PAD_TOP = 20;
export const CHART_PAD_BOTTOM = 30;
export const CHART_INNER_WIDTH = CHART_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
export const CHART_INNER_HEIGHT = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
export const CHART_HIT_RADIUS = 24;

export interface ChartPointCoord {
  readonly point: HistoricalChartPoint;
  readonly cx: number;
  readonly cy: number;
}

export interface SvgBoundsRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Maps a season start year to its horizontal SVG coordinate.
 *
 * @param year - Season start year.
 * @param minYear - Earliest year plotted on the chart.
 * @param yearSpan - Total span of years (>= 1).
 * @returns X coordinate in SVG viewBox units.
 */
export function getChartYearX(year: number, minYear: number, yearSpan: number): number {
  return CHART_PAD_LEFT + ((year - minYear) / yearSpan) * CHART_INNER_WIDTH;
}

/**
 * Maps an effective league rank (1..42) to its vertical SVG coordinate.
 *
 * @param effectiveRank - Combined 1st/2nd division rank (1 at top, 42 at bottom).
 * @returns Y coordinate in SVG viewBox units.
 */
export function getChartRankY(effectiveRank: number): number {
  return CHART_PAD_TOP + ((effectiveRank - 1) / 41) * CHART_INNER_HEIGHT;
}

/**
 * Computes SVG viewBox coordinates for every historical chart point.
 *
 * @param points - Ordered array of historical season points.
 * @returns Array of points paired with their `(cx, cy)` SVG coordinates.
 */
export function computeChartPointCoords(
  points: readonly HistoricalChartPoint[]
): readonly ChartPointCoord[] {
  if (points.length === 0) return [];
  const minYear = points[0]!.year;
  const maxYear = points[points.length - 1]!.year;
  const yearSpan = Math.max(maxYear - minYear, 1);

  return points.map((point) => ({
    point,
    cx: getChartYearX(point.year, minYear, yearSpan),
    cy: getChartRankY(point.effectiveRank),
  }));
}

/**
 * Converts viewport pointer coordinates into SVG viewBox coordinates.
 *
 * @param clientX - Pointer X coordinate in viewport pixels.
 * @param clientY - Pointer Y coordinate in viewport pixels.
 * @param rect - Rendered bounding box of the SVG element.
 * @returns SVG coordinates `{ x, y }`, or `null` if the SVG has zero dimensions.
 */
export function clientToSvgCoords(
  clientX: number,
  clientY: number,
  rect: SvgBoundsRect
): { readonly x: number; readonly y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: ((clientX - rect.left) / rect.width) * CHART_WIDTH,
    y: ((clientY - rect.top) / rect.height) * CHART_HEIGHT,
  };
}

/**
 * Finds the closest plotted season point to a given SVG coordinate using 2D Euclidean distance.
 * Avoids order-dependent overlap bias when adjacent years are closer than touch target radii.
 *
 * @param coords - Precomputed SVG coordinates for all plotted seasons.
 * @param svgX - Pointer X coordinate in SVG viewBox units.
 * @param svgY - Pointer Y coordinate in SVG viewBox units.
 * @param maxDistance - Maximum distance threshold in SVG units (defaults to `CHART_HIT_RADIUS`).
 * @returns The closest `ChartPointCoord` within `maxDistance`, or `null` if none is close enough.
 */
export function findNearestChartPoint(
  coords: readonly ChartPointCoord[],
  svgX: number,
  svgY: number,
  maxDistance: number = CHART_HIT_RADIUS
): ChartPointCoord | null {
  let nearest: ChartPointCoord | null = null;
  let minDistSq = maxDistance * maxDistance;

  for (const item of coords) {
    const dx = item.cx - svgX;
    const dy = item.cy - svgY;
    const distSq = dx * dx + dy * dy;
    if (distSq <= minDistSq) {
      minDistSq = distSq;
      nearest = item;
    }
  }

  return nearest;
}
