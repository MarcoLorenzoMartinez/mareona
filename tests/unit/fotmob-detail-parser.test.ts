import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFotMobMatchLineup, parseFotMobMatchEvents } from '../../src/lib/sports-api/fotmob-match-detail-parser.ts';

describe('FotMob Match Detail Parser', () => {
  it('parses starters and substitutes into DomainMatchLineup correctly', () => {
    const rawTeam = {
      id: 9869,
      name: 'Sporting Gijón',
      formation: '4-2-3-1',
      starters: [
        {
          id: 1325585,
          name: 'Arana',
          shirtNumber: '13',
          positionId: 11,
          usualPlayingPositionId: 0,
        },
        {
          id: 643537,
          name: 'Juan Otero',
          shirtNumber: '19',
          positionId: 115,
          usualPlayingPositionId: 3,
        },
      ],
      subs: [
        {
          id: 477594,
          name: 'Rubén Yánez',
          shirtNumber: '1',
          usualPlayingPositionId: 0,
        },
      ],
    };

    const lineup = parseFotMobMatchLineup(rawTeam, true);
    assert.ok(lineup);
    assert.equal(lineup.teamId, '9869');
    assert.equal(lineup.isSporting, true);
    assert.equal(lineup.formation, '4-2-3-1');
    assert.equal(lineup.starters.length, 2);
    assert.equal(lineup.starters[0].name, 'Arana');
    assert.equal(lineup.starters[0].position, 'goalkeeper');
    assert.equal(lineup.starters[0].jersey, 13);
    assert.equal(lineup.starters[1].position, 'forward');
    assert.equal(lineup.substitutes.length, 1);
    assert.equal(lineup.substitutes[0].name, 'Rubén Yánez');
    assert.equal(lineup.substitutes[0].position, 'goalkeeper');
  });

  it('parses FotMob goal and penalty events into DomainMatchEvent correctly', () => {
    const rawEvents = [
      {
        eventId: 101,
        type: 'Goal',
        time: 36,
        timeStr: 36,
        isHome: true,
        player: { id: 792308, name: 'Pablo Vázquez' },
        ownGoal: true,
      },
      {
        eventId: 102,
        type: 'Goal',
        time: 61,
        timeStr: 61,
        isHome: false,
        player: { id: 643537, name: 'Juan Otero' },
      },
      {
        eventId: 103,
        type: 'Half',
        time: 45,
      },
    ];

    const events = parseFotMobMatchEvents(rawEvents, false, true, '161741', '9869');
    assert.equal(events.length, 2); // Half is filtered out
    assert.equal(events[0].minute, "36'");
    assert.equal(events[0].type, 'goal');
    assert.equal(events[0].isSporting, false); // Guijuelo is home and sporting is away
    assert.equal(events[1].minute, "61'");
    assert.equal(events[1].type, 'goal');
    assert.equal(events[1].isSporting, true);
    assert.equal(events[1].player.name, 'Juan Otero');
  });
});
