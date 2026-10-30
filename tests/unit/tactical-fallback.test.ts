import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateFallbackTacticalLineup } from '../../src/lib/sports-api/tactical-lineup-fallback.ts';
import type { DomainLineupPlayer } from '../../src/lib/sports-api/types.ts';

describe('Tactical Lineup Fallback Generator', () => {
  it('generates 11 coordinate nodes matching formation for 4-2-3-1', () => {
    const mockStarters: DomainLineupPlayer[] = [
      { id: '1', name: 'Portero', shortName: 'Portero', jersey: 1, position: 'goalkeeper', positionLabel: 'Portero', formationPlace: 1, isStarter: true, photoUrl: '' },
      { id: '2', name: 'Defensa 1', shortName: 'Def 1', jersey: 2, position: 'defender', positionLabel: 'Defensa', formationPlace: 2, isStarter: true, photoUrl: '' },
      { id: '3', name: 'Defensa 2', shortName: 'Def 2', jersey: 3, position: 'defender', positionLabel: 'Defensa', formationPlace: 3, isStarter: true, photoUrl: '' },
      { id: '4', name: 'Defensa 3', shortName: 'Def 3', jersey: 4, position: 'defender', positionLabel: 'Defensa', formationPlace: 4, isStarter: true, photoUrl: '' },
      { id: '5', name: 'Defensa 4', shortName: 'Def 4', jersey: 5, position: 'defender', positionLabel: 'Defensa', formationPlace: 5, isStarter: true, photoUrl: '' },
      { id: '6', name: 'Medio 1', shortName: 'Med 1', jersey: 6, position: 'midfielder', positionLabel: 'Medio', formationPlace: 6, isStarter: true, photoUrl: '' },
      { id: '7', name: 'Medio 2', shortName: 'Med 2', jersey: 7, position: 'midfielder', positionLabel: 'Medio', formationPlace: 7, isStarter: true, photoUrl: '' },
      { id: '8', name: 'Medio 3', shortName: 'Med 3', jersey: 8, position: 'midfielder', positionLabel: 'Medio', formationPlace: 8, isStarter: true, photoUrl: '' },
      { id: '9', name: 'Medio 4', shortName: 'Med 4', jersey: 9, position: 'midfielder', positionLabel: 'Medio', formationPlace: 9, isStarter: true, photoUrl: '' },
      { id: '10', name: 'Medio 5', shortName: 'Med 5', jersey: 10, position: 'midfielder', positionLabel: 'Medio', formationPlace: 10, isStarter: true, photoUrl: '' },
      { id: '11', name: 'Delantero', shortName: 'Del', jersey: 11, position: 'forward', positionLabel: 'Delantero', formationPlace: 11, isStarter: true, photoUrl: '' },
    ];

    const tactical = generateFallbackTacticalLineup(mockStarters, '4-2-3-1', true);
    assert.ok(tactical);
    assert.equal(tactical.starters.length, 11);
    assert.equal(tactical.formation, '4-2-3-1');
    assert.equal(tactical.starters[0].name, 'Portero');
    assert.equal(tactical.starters[0].y, 0.1); // Goalkeeper
    assert.equal(tactical.starters[10].name, 'Delantero');
    assert.equal(tactical.starters[10].y, 0.88); // Striker
  });

  it('returns null if starters is empty or less than 7 players', () => {
    assert.equal(generateFallbackTacticalLineup([], '4-4-2', false), null);
  });
});
