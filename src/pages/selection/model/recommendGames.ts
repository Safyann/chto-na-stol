import { hasNotes, lastPlayedLabel, type Game } from '../../../entities/game';

export interface Criteria {
  players: number;
  minutes: number;
  beginners: boolean;
}

export const initialCriteria: Criteria = { players: 4, minutes: 60, beginners: true };

export function recommendGames(games: Game[], criteria: Criteria, prioritizeOld: boolean) {
  return games
    .filter(
      (game) =>
        game.minPlayers <= criteria.players &&
        criteria.players <= game.maxPlayers &&
        game.minutes <= criteria.minutes &&
        (!criteria.beginners || game.beginners),
    )
    .sort((first, second) => {
      if (prioritizeOld) {
        const byDate = (first.lastPlayed || '9999').localeCompare(second.lastPlayed || '9999');
        if (byDate) return byDate;
      }

      return Number(hasNotes(second)) - Number(hasNotes(first)) || second.minutes - first.minutes;
    })
    .slice(0, 3);
}

export function explainMatch(game: Game, criteria: Criteria, prioritizeOld: boolean) {
  const fit = criteria.beginners ? 'Подходит новичкам.' : 'Подходит по числу игроков.';
  const timeLeft = criteria.minutes - game.minutes;
  const timing = timeLeft ? `Останется ${timeLeft} мин.` : 'Партия займёт всё отведённое время.';
  return `${fit} ${prioritizeOld ? lastPlayedLabel(game) : timing}`;
}
