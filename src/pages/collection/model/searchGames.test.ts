import { expect, it } from 'vitest';
import collection from '../../../../data/collection.json';
import { searchGames } from './searchGames';

it('ищет по названию без учёта регистра, ё, знаков препинания и порядка слов', () => {
  expect(searchGames(collection, 'РОЗЫ черной').map((game) => game.id)).toEqual([
    'hg-vojni-chjornoj-rozi-vozrozhdenie',
  ]);
  expect(searchGames(collection, 'Нью Йорк').map((game) => game.id)).toEqual([
    'hg-pobeg-iz-nju-jorka',
  ]);
});

it('показывает базовую игру по названию дополнения и обрабатывает пустой результат', () => {
  expect(searchGames(collection, 'красная смерть').map((game) => game.id)).toEqual([
    'hg-oskvernjonnij-graal-padenie-avalona-vtoraja-redakcija',
  ]);
  expect(searchGames(collection, 'несуществующая игра')).toEqual([]);
  expect(searchGames(collection, '   ')).toBe(collection);
});
