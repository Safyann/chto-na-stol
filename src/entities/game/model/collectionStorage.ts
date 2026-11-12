import { type Game } from './game';

const storageKey = 'chto-na-stol.collection.v1';
type StoredGame = Game & { demo?: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isExpansionList(value: unknown) {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every((name) => typeof name === 'string' && name.trim().length > 0) &&
      new Set(value).size === value.length)
  );
}

function isSourceUrl(value: unknown) {
  return (
    value === undefined ||
    (typeof value === 'string' && URL.canParse(value) && new URL(value).protocol === 'https:')
  );
}

function isGame(value: unknown): value is StoredGame {
  if (!isRecord(value)) return false;

  const { id, title, minPlayers, maxPlayers, minutes, beginners, demo, lastPlayed, art, notes } =
    value;
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    typeof title === 'string' &&
    title.trim().length > 0 &&
    isPositiveInteger(minPlayers) &&
    isPositiveInteger(maxPlayers) &&
    minPlayers <= maxPlayers &&
    isPositiveInteger(minutes) &&
    typeof beginners === 'boolean' &&
    (demo === undefined || typeof demo === 'boolean') &&
    typeof lastPlayed === 'string' &&
    (lastPlayed === '' ||
      (/^\d{4}-\d{2}-\d{2}$/.test(lastPlayed) && Number.isFinite(Date.parse(lastPlayed)))) &&
    isExpansionList(value.expansions) &&
    isExpansionList(value.lastPlayedExpansions) &&
    isSourceUrl(value.sourceUrl) &&
    (art === undefined || art === 'moon' || art === 'words' || art === 'tiles') &&
    isRecord(notes) &&
    Object.values(notes).every((note) => typeof note === 'string')
  );
}

export function parseCollection(raw: string): Game[] {
  const parsed: unknown = JSON.parse(raw);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(isGame) ||
    new Set(parsed.map((game) => game.id)).size !== parsed.length
  ) {
    throw new Error('Некорректный файл коллекции');
  }
  return parsed.filter((game) => game.demo !== true);
}

export function mergeCollection(current: Game[], imported: Game[]): Game[] {
  const merged = new Map(imported.map((game) => [game.id, game]));
  for (const game of current) {
    merged.set(game.id, game);
  }
  return [...merged.values()];
}

export function saveCollection(games: Game[]) {
  localStorage.setItem(storageKey, JSON.stringify(games));
}

export function readCollection() {
  const stored = localStorage.getItem(storageKey);
  return stored === null ? null : parseCollection(stored);
}

export function loadCollection() {
  try {
    return { games: readCollection() ?? [], storageError: false };
  } catch {
    return { games: [], storageError: true };
  }
}
