import { expect, it } from 'vitest';
import { hasNotes, type Game } from '../../../entities/game';
import { recommendGames } from './recommendGames';

it('меняет порядок подходящих игр при переключении на давние партии', () => {
  const games: Game[] = [
    { title: 'Игра А', minutes: 40, lastPlayed: '2026-09-01', notes: { setup: 'Раздать карты.' } },
    {
      title: 'Игра Б',
      minutes: 30,
      lastPlayed: '2026-09-10',
      notes: { setup: 'Разложить фишки.' },
    },
    { title: 'Игра В', minutes: 20, lastPlayed: '2026-09-20', notes: { setup: 'Выложить поле.' } },
    { title: 'Игра Г', minutes: 60, lastPlayed: '2026-08-20', notes: {} },
  ].map((game, index) => ({
    ...game,
    id: String(index),
    minPlayers: 2,
    maxPlayers: 4,
    beginners: true,
  }));
  const criteria = { players: 4, minutes: 60, beginners: true };
  const standard = recommendGames(games, criteria, false);
  const rotated = recommendGames(games, criteria, true);

  expect(standard).toHaveLength(3);
  expect(standard.every(hasNotes)).toBe(true);
  expect(rotated.map((game) => game.title)).toEqual(['Игра Г', 'Игра А', 'Игра Б']);
  expect(recommendGames(games, { ...criteria, minutes: 1 }, false)).toEqual([]);
});
