import { hasNotes, type Game } from '../model/game';
import { gameMeta } from './gameLabels';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  description: string;
  heading: 'h2' | 'h3';
  onOpen: (game: Game, opener: HTMLButtonElement) => void;
}

const artStyles = {
  moon: styles.artMoon,
  words: styles.artWords,
  tiles: styles.artTiles,
  pattern: styles.artPattern,
};

export function GameCard({ game, description, heading: Heading, onOpen }: GameCardProps) {
  const label = hasNotes(game) ? 'Шпаргалка' : 'Открыть игру';

  return (
    <li className={styles.gameCard}>
      <div className={`${styles.gameArt} ${artStyles[game.art ?? 'pattern']}`} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.gameBody}>
        <Heading className={styles.gameTitle}>{game.title}</Heading>
        <p className={styles.gameMeta}>{gameMeta(game)}</p>
        <p className={styles.gameDescription}>{description}</p>
        <button
          className={styles.openGame}
          type="button"
          aria-label={`${label} — ${game.title}`}
          onClick={(event) => onOpen(game, event.currentTarget)}
        >
          {label} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </li>
  );
}
