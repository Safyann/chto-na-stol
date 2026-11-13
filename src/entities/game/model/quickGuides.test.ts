import { expect, it } from 'vitest';
import collection from '../../../../data/collection.json';
import { parseCollection } from './collectionStorage';
import { getQuickGuide, hasNotes } from './game';
import { quickGuides } from './quickGuides';

it('находит готовые шпаргалки у ранее импортированных игр без заметок', () => {
  const games = parseCollection(JSON.stringify(collection));
  const gamesWithGuides = games.filter(hasNotes);

  expect(gamesWithGuides.map((game) => game.id).sort()).toEqual(Object.keys(quickGuides).sort());
  for (const game of gamesWithGuides) {
    expect(getQuickGuide(game)?.notes.firstTurn).toBeTruthy();
    expect(game.notes).toEqual({});
  }
  expect(getQuickGuide({ ...games[0], id: 'constructor' })).toBeUndefined();
});
