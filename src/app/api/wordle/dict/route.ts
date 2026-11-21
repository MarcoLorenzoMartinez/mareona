import { NextResponse, type NextRequest } from 'next/server';
import { getDictionaryForLength } from '@/lib/wordle/dictionary';

/**
 * Serves packed Spanish lexicon strings per word length on demand,
 * keeping the 2+ MB dictionary out of the Wordle client JS bundle.
 */
export async function GET(request: NextRequest) {
  const lenParam = Number(request.nextUrl.searchParams.get('len'));
  if (!Number.isInteger(lenParam) || lenParam < 4 || lenParam > 10) {
    return NextResponse.json({ error: 'Invalid length' }, { status: 400 });
  }

  const dict = getDictionaryForLength(lenParam);
  if (!dict) {
    return NextResponse.json({ dict: '' }, { status: 200 });
  }

  return NextResponse.json(
    { dict },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
