import { expect, it } from 'vitest';
import collection from '../../../../data/collection.json';
import { getGameCover } from './gameCovers';

it('сопоставляет обложки с идентификаторами импортированных игр', () => {
  for (const game of collection) expect(getGameCover(game.id)).toBeTruthy();
  expect(getGameCover('game-without-cover')).toBeUndefined();
});
