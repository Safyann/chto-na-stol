import type { Game } from '../../../entities/game';

function normalizeSearchText(text: string) {
  return text
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function searchGames(games: Game[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return games;

  const words = normalizedQuery.split(' ');
  return games.filter((game) =>
    [game.title, ...(game.expansions ?? [])].some((name) => {
      const normalizedName = normalizeSearchText(name);
      return words.every((word) => normalizedName.includes(word));
    }),
  );
}
