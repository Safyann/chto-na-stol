export type Art = 'moon' | 'words' | 'tiles';

export type Notes = Partial<Record<keyof typeof noteFields, string>>;

export interface Game {
  id: string;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  minutes: number;
  beginners: boolean;
  lastPlayed: string;
  notes: Notes;
  demo: boolean;
  art?: Art;
}

export const noteFields = {
  setup: 'Что разложить',
  firstTurn: 'Как объяснить первый ход',
  reminder: 'Что легко забыть',
};

export function hasNotes(game: Game) {
  return Object.values(game.notes).some(Boolean);
}
