import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCollection, mergeCollection, parseCollection } from './collectionStorage';
import { recordGamePlay, type Game } from './game';

const game: Game = {
  id: 'personal-1',
  title: 'Моя игра',
  minPlayers: 2,
  maxPlayers: 4,
  minutes: 30,
  beginners: true,
  lastPlayed: '',
  notes: { setup: 'Раздать карты.' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

it('открывает пустую коллекцию при первом запуске', () => {
  const setItem = vi.fn();
  vi.stubGlobal('localStorage', { getItem: () => null, setItem });

  expect(loadCollection()).toEqual({ games: [], storageError: false });
  expect(setItem).not.toHaveBeenCalled();
});

it('показывает личные игры из старого хранилища', () => {
  const demo = { ...game, id: 'demo-1', demo: true };
  const adopted = { ...game, id: 'demo-2', demo: false, lastPlayed: '2026-09-06' };
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify([demo, adopted, game]) });

  expect(loadCollection()).toEqual({ games: [adopted, game], storageError: false });
});

describe('перенос коллекции', () => {
  it('читает старые записи с датами и шпаргалками', () => {
    const played = { ...game, lastPlayed: '2026-09-06', demo: false };

    expect(parseCollection(JSON.stringify([played]))).toEqual([played]);
    expect(parseCollection('[]')).toEqual([]);
    expect(() => parseCollection(JSON.stringify([played, played]))).toThrow();
  });

  it('принимает HTTPS-ссылку на карточку игры', () => {
    const sourced = { ...game, sourceUrl: 'https://hobbygames.ru/pixel-tactics' };

    expect(parseCollection(JSON.stringify([sourced]))).toEqual([sourced]);
    expect(() =>
      parseCollection(JSON.stringify([{ ...game, sourceUrl: 'javascript:alert(1)' }])),
    ).toThrow();
  });

  it('сохраняет личные правки при переносе и пропускает демоигры', () => {
    const demo = { ...game, id: 'demo-1', demo: true };
    const imported = { ...game, id: 'personal-2', lastPlayed: '2026-09-06' };
    const backup = parseCollection(
      JSON.stringify([demo, imported, { ...game, title: 'Старая запись' }]),
    );

    expect(mergeCollection([game], backup)).toEqual([imported, game]);
  });

  it('сохраняет состав последней партии и допускает игру без дополнений', () => {
    const gameWithExpansions = { ...game, expansions: ['Лес', 'Горы'] };
    const date = '2026-09-06';
    const withExpansions = recordGamePlay(gameWithExpansions, date, [
      'Горы',
      'Лес',
      'Удалённое дополнение',
    ]);
    const baseGame = recordGamePlay(withExpansions, date, []);

    expect(withExpansions.lastPlayedExpansions).toEqual(['Лес', 'Горы']);
    expect(baseGame.lastPlayedExpansions).toEqual([]);
    expect(parseCollection(JSON.stringify([withExpansions]))).toEqual([withExpansions]);
    expect(parseCollection(JSON.stringify([baseGame]))).toEqual([baseGame]);
    expect(() => parseCollection(JSON.stringify([{ ...game, expansions: [123] }]))).toThrow();
  });
});
