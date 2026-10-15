export interface PlayerBiometrics {
  readonly height: string | null;
  readonly age: number | null;
  readonly birthDate: string | null;
  readonly preferredFoot: "Diestro" | "Zurdo" | "Ambidiestro" | null;
  readonly country: string | null;
  readonly countryCode: string | null;
  readonly marketValue: string | null;
  readonly contractEnd: string | null;
}

export interface PlayerPitchPosition {
  readonly label: string;
  readonly shortLabel: string;
  readonly occurrences: number;
  readonly isMain: boolean;
  readonly pitchCoordinates: {
    readonly xPercent: number;
    readonly yPercent: number;
  } | null;
}

export interface PlayerPositionsData {
  readonly primaryPosition: string;
  readonly primaryPositionShort: string;
  readonly allPositions: readonly PlayerPitchPosition[];
}

export interface PlayerHeatmapPoint {
  readonly x: number;
  readonly y: number;
}

export interface PlayerProfileStatItem {
  readonly title: string;
  readonly statValue: string;
  readonly per90: number;
  readonly percentileRank?: number;
}

export interface PlayerProfileStatGroup {
  readonly title: string;
  readonly items: readonly PlayerProfileStatItem[];
}

export interface PlayerSeasonMatchLog {
  readonly matchId: number;
  readonly date: string;
  readonly opponentName: string;
  readonly opponentTeamId: number;
  readonly isHome: boolean;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly result: "W" | "D" | "L";
  readonly minutesPlayed: number;
  readonly goals: number;
  readonly assists: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly rating: number | null;
  readonly isTopRating: boolean;
  readonly onBench: boolean;
  readonly playedInMatch: boolean;
}

export interface DomainPlayerProfile {
  readonly fotmobId: number;
  readonly name: string;
  readonly shirtNumber: number | null;
  readonly biometrics: PlayerBiometrics;
  readonly positions: PlayerPositionsData;
  readonly heatmap: readonly PlayerHeatmapPoint[];
  readonly statsGroups: readonly PlayerProfileStatGroup[];
  readonly recentMatches: readonly PlayerSeasonMatchLog[];
}

export interface FotMobRawPlayerData {
  readonly id: number;
  readonly name: string;
  readonly birthDate?: { readonly utcTime?: string };
  readonly playerInformation?: ReadonlyArray<{
    readonly title?: string;
    readonly value?: {
      readonly fallback?: string | number | { readonly utcTime?: string };
      readonly key?: string;
      readonly numberValue?: number;
    };
    readonly countryCode?: string;
  }>;
  readonly positionDescription?: {
    readonly primaryPosition?: { readonly label?: string; readonly key?: string };
    readonly positions?: ReadonlyArray<{
      readonly position?: string;
      readonly strPos?: { readonly label?: string };
      readonly strPosShort?: { readonly label?: string };
      readonly occurences?: number;
      readonly isMainPosition?: boolean;
      readonly pitchPositionData?: { readonly right?: number; readonly top?: number } | null;
    }>;
  };
  readonly firstSeasonStats?: {
    readonly heatmap?: { readonly coordinates?: ReadonlyArray<{ readonly x: number; readonly y: number }> };
    readonly statsSection?: {
      readonly items?: ReadonlyArray<{
        readonly title?: string;
        readonly items?: ReadonlyArray<{
          readonly title?: string;
          readonly statValue?: string | number;
          readonly per90?: number;
          readonly percentileRank?: number;
        }>;
      }>;
    };
  };
  readonly recentMatches?: ReadonlyArray<{
    readonly id: number;
    readonly matchDate?: { readonly utcTime?: string };
    readonly opponentTeamName?: string;
    readonly opponentTeamId?: number;
    readonly isHomeTeam?: boolean;
    readonly homeScore?: number;
    readonly awayScore?: number;
    readonly minutesPlayed?: number;
    readonly goals?: number;
    readonly assists?: number;
    readonly yellowCards?: number;
    readonly redCards?: number;
    readonly ratingProps?: { readonly rating?: string; readonly isTopRating?: boolean };
    readonly onBench?: boolean;
    readonly playedInMatch?: boolean;
    readonly lineupPositionId?: number;
  }>;
}
