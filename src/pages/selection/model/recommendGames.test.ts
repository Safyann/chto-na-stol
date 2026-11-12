import { expect, it } from 'vitest';
import { createDemoCollection, hasNotes } from '../../../entities/game';
import { recommendGames } from './recommendGames';

it('меняет порядок подходящих игр при переключении на давние партии', () => {
  const games = createDemoCollection();
  const criteria = { players: 4, minutes: 60, beginners: true };
  const standard = recommendGames(games, criteria, false);
  const rotated = recommendGames(games, criteria, true);

  expect(standard).toHaveLength(3);
  expect(standard.every(hasNotes)).toBe(true);
  expect(rotated.map((game) => game.title)).toEqual(['Диксит', 'Билет на поезд: Европа', 'Азул']);
  expect(recommendGames(games, { ...criteria, minutes: 1 }, false)).toEqual([]);
});
