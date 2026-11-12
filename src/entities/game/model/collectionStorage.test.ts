import { describe, expect, it } from 'vitest';
import { mergeCollection, parseCollection } from './collectionStorage';
import { createDemoCollection } from './demoCatalog';

describe('перенос коллекции', () => {
  it('читает старые записи с датами и шпаргалками', () => {
    const [demo] = createDemoCollection();
    const played = { ...demo, lastPlayed: '2026-09-06', demo: false };

    expect(parseCollection(JSON.stringify([played]))).toEqual([played]);
    expect(parseCollection('[]')).toEqual([]);
    expect(() => parseCollection(JSON.stringify([played, played]))).toThrow();
  });

  it('сохраняет личные правки при переносе и учитывает удалённые демоигры', () => {
    const demo = createDemoCollection();
    const [first, second, third] = demo;
    const existing = { ...first, title: 'Мой Диксит', demo: false };
    const imported = { ...second, lastPlayed: '2026-09-06', demo: false };

    expect(mergeCollection([existing, second, third], [first, imported])).toEqual([
      existing,
      imported,
    ]);
  });
});
