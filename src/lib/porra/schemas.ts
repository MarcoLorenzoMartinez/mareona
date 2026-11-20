import { z } from 'zod';

/**
 * Zod validation schema for submitting a La Porra match prediction.
 */
export const submitPorraPredictionSchema = z.object({
  matchId: z
    .string()
    .trim()
    .min(1, 'El identificador del partido es obligatorio')
    .max(120, 'Identificador de partido inválido'),
  homeScore: z
    .number()
    .int('Los goles deben ser un número entero')
    .min(0, 'El marcador mínimo es 0')
    .max(9, 'El marcador máximo permitido es 9'),
  awayScore: z
    .number()
    .int('Los goles deben ser un número entero')
    .min(0, 'El marcador mínimo es 0')
    .max(9, 'El marcador máximo permitido es 9'),
  sportingScorers: z
    .array(z.string().trim().min(1).max(80))
    .max(9, 'No puedes seleccionar más de 9 goleadores'),
});

export type SubmitPorraPredictionInput = z.infer<typeof submitPorraPredictionSchema>;
