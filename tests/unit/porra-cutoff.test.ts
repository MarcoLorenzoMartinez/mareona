import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isPorraSubmissionOpen, PORRA_CUTOFF_MS } from '../../src/lib/porra/engine.ts';

describe('Porra Engine Submission Cutoff Rules', () => {
  it('allows submission when match is scheduled and kickoff is in the future (> 1 minute)', () => {
    const futureKickoff = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    assert.equal(isPorraSubmissionOpen(futureKickoff, 'scheduled'), true);
  });

  it('blocks submission exactly 1 minute or less before kickoff', () => {
    const fortySecondsBefore = new Date(Date.now() + 40 * 1000).toISOString();
    assert.equal(isPorraSubmissionOpen(fortySecondsBefore, 'scheduled'), false);

    const exactlyCutoff = new Date(Date.now() + PORRA_CUTOFF_MS).toISOString();
    assert.equal(isPorraSubmissionOpen(exactlyCutoff, 'scheduled'), false);
  });

  it('blocks submission after kickoff has passed', () => {
    const pastKickoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    assert.equal(isPorraSubmissionOpen(pastKickoff, 'scheduled'), false);
  });

  it('blocks submission if status is live even if kickoff timestamp is malformed or upcoming', () => {
    const futureKickoff = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    assert.equal(isPorraSubmissionOpen(futureKickoff, 'live'), false);
  });

  it('blocks submission if status is finished', () => {
    const futureKickoff = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    assert.equal(isPorraSubmissionOpen(futureKickoff, 'finished'), false);
  });
});
