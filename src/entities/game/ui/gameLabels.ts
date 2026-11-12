import { localDate } from '../../../shared/lib/date';
import { type Game } from '../model/game';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });

export function gameMeta(game: Game) {
  const range =
    game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`;
  return `${range} чел. · ${game.minutes} мин`;
}

export function lastPlayedLabel(game: Game) {
  if (!game.lastPlayed) return 'Дата последней партии неизвестна';
  if (game.lastPlayed === localDate()) return 'Играли сегодня';
  return `Последняя партия — ${dateFormatter.format(new Date(`${game.lastPlayed}T00:00:00`))}`;
}
