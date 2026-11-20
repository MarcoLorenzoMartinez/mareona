'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  fetchMatchDetail,
  fetchNextFixture,
  fetchSportingSeasonMatches,
} from '@/lib/sports-api/client';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import {
  BANNED_USER_POST_MESSAGE,
  isProfileActivelyBanned,
} from '@/lib/social/moderation';
import { evaluatePorraPrediction, isPorraSubmissionOpen } from './engine';
import {
  submitPorraPredictionSchema,
  type SubmitPorraPredictionInput,
} from './schemas';
import type { PorraMatch, PorraPrediction } from './types';

interface ActionResult<T = void> {
  readonly success: boolean;
  readonly error?: string;
  readonly data?: T;
}

export interface UserPorraState {
  readonly predictionsByMatchId: Record<string, PorraPrediction>;
  readonly settledCount: number;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Persists an immutable user match prediction to Supabase `public.predictions`.
 * Validates user session, ban status, rate limits, official kickoff cutoff, and scorer count.
 *
 * @param input - Match prediction payload validated against `submitPorraPredictionSchema`.
 * @returns ActionResult containing the persisted PorraPrediction on success.
 */
export async function submitPorraPrediction(
  input: SubmitPorraPredictionInput
): Promise<ActionResult<PorraPrediction>> {
  const parsed = submitPorraPredictionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Pronóstico inválido',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'El servicio de base de datos no está disponible en este momento',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para registrar tu pronóstico',
      };
    }

    const rateLimit = checkRateLimit({
      key: `porra_submit_${user.id}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rateLimit.allowed) {
      return { success: false, error: rateLimit.error };
    }

    const [{ data: profile }, { data: existing }] = await Promise.all([
      supabase
        .from('profiles')
        .select('is_banned, banned_until, banned_reason')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('predictions')
        .select('id')
        .eq('user_id', user.id)
        .eq('match_id', parsed.data.matchId)
        .maybeSingle(),
    ]);

    if (isProfileActivelyBanned(profile)) {
      return { success: false, error: BANNED_USER_POST_MESSAGE };
    }

    if (existing) {
      return {
        success: false,
        error: 'Ya has registrado un pronóstico definitivo para este partido',
      };
    }

    const nextFixture = await fetchNextFixture();
    const targetMatch =
      nextFixture?.externalId === parsed.data.matchId
        ? nextFixture
        : await fetchMatchDetail(parsed.data.matchId);

    if (
      !targetMatch ||
      !isPorraSubmissionOpen(targetMatch.kickoffAt, targetMatch.status)
    ) {
      return {
        success: false,
        error: 'El plazo para pronosticar este partido está cerrado',
      };
    }

    const sportingGoals = targetMatch.homeTeam.isSporting
      ? parsed.data.homeScore
      : parsed.data.awayScore;
    const sanitizedScorers = parsed.data.sportingScorers.slice(0, sportingGoals);

    const { data: inserted, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        match_id: parsed.data.matchId,
        home_score: parsed.data.homeScore,
        away_score: parsed.data.awayScore,
        sporting_scorers: sanitizedScorers,
      })
      .select('match_id, home_score, away_score, sporting_scorers, created_at')
      .single();

    if (error || !inserted) {
      return {
        success: false,
        error: error?.message ?? 'No se pudo guardar tu pronóstico',
      };
    }

    revalidatePath('/juegos/porra');

    return {
      success: true,
      data: {
        matchId: inserted.match_id,
        homeScore: inserted.home_score,
        awayScore: inserted.away_score,
        sportingScorers: Array.isArray(inserted.sporting_scorers)
          ? inserted.sporting_scorers
          : [],
        submittedAt: inserted.created_at,
      },
    };
  } catch {
    return {
      success: false,
      error: 'Error de conexión al guardar tu pronóstico',
    };
  }
}

/**
 * Fetches all predictions stored in Supabase for the authenticated user and
 * settles `points_awarded` on any finished match predictions not yet scored.
 * Database trigger `predictions_sync_profile_points` automatically keeps `profiles.points` in sync.
 *
 * @returns User's persisted predictions indexed by external match ID and count of newly settled rows.
 */
export async function fetchAndSettleUserPorraState(): Promise<UserPorraState> {
  if (!isSupabaseConfigured()) {
    return { predictionsByMatchId: {}, settledCount: 0 };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { predictionsByMatchId: {}, settledCount: 0 };
    }

    const { data: rows, error } = await supabase
      .from('predictions')
      .select(
        'id, match_id, home_score, away_score, sporting_scorers, points_awarded, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !rows || rows.length === 0) {
      return { predictionsByMatchId: {}, settledCount: 0 };
    }

    const predictionsByMatchId: Record<string, PorraPrediction> = {};
    for (const row of rows) {
      predictionsByMatchId[row.match_id] = {
        matchId: row.match_id,
        homeScore: row.home_score,
        awayScore: row.away_score,
        sportingScorers: Array.isArray(row.sporting_scorers)
          ? row.sporting_scorers
          : [],
        submittedAt: row.created_at,
      };
    }

    const unsettledRows = rows.filter((r) => r.points_awarded === null);
    if (unsettledRows.length === 0) {
      return { predictionsByMatchId, settledCount: 0 };
    }

    const seasonMatches = await fetchSportingSeasonMatches();
    const finishedByExternalId = new Map(
      seasonMatches
        .filter(
          (m) =>
            m.status === 'finished' &&
            m.homeScore !== null &&
            m.awayScore !== null
        )
        .map((m) => [m.externalId, m])
    );

    const rowsToSettle = unsettledRows.filter((r) =>
      finishedByExternalId.has(r.match_id)
    );

    if (rowsToSettle.length === 0) {
      return { predictionsByMatchId, settledCount: 0 };
    }

    const db = createAdminClient() ?? supabase;
    let settledCount = 0;

    await Promise.all(
      rowsToSettle.map(async (row) => {
        const summary = finishedByExternalId.get(row.match_id);
        if (!summary || summary.homeScore === null || summary.awayScore === null) {
          return;
        }

        const sportingGoals = summary.homeTeam.isSporting
          ? summary.homeScore
          : summary.awayScore;

        let actualSportingScorers: string[] = [];
        if (sportingGoals > 0) {
          const detail = await fetchMatchDetail(summary.externalId).catch(
            () => null
          );
          if (detail) {
            actualSportingScorers = detail.events
              .filter((ev) => ev.type === 'goal' && ev.isSporting)
              .map((ev) => ev.player.name);
          }
        }

        const porraMatch: PorraMatch = {
          id: summary.externalId,
          roundName: summary.competition,
          matchday: summary.matchday ?? undefined,
          homeTeam: {
            name: summary.homeTeam.name,
            crestUrl: summary.homeTeam.crestUrl ?? undefined,
            isSporting: summary.homeTeam.isSporting,
          },
          awayTeam: {
            name: summary.awayTeam.name,
            crestUrl: summary.awayTeam.crestUrl ?? undefined,
            isSporting: summary.awayTeam.isSporting,
          },
          kickoffAt: summary.kickoffAt,
          isFinished: true,
          actualHomeScore: summary.homeScore,
          actualAwayScore: summary.awayScore,
          actualSportingScorers,
        };

        const prediction = predictionsByMatchId[row.match_id];
        if (!prediction) return;

        const evaluation = evaluatePorraPrediction(prediction, porraMatch);
        const { error: updateErr } = await db
          .from('predictions')
          .update({ points_awarded: evaluation.points })
          .eq('id', row.id)
          .eq('user_id', user.id)
          .is('points_awarded', null);

        if (!updateErr) {
          settledCount += 1;
        }
      })
    );

    return { predictionsByMatchId, settledCount };
  } catch {
    return { predictionsByMatchId: {}, settledCount: 0 };
  }
}
