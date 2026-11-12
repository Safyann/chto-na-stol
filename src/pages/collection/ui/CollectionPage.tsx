import { useRef, type Ref } from 'react';
import { GameCard, lastPlayedLabel, type Game } from '../../../entities/game';
import ui from '../../../shared/ui/ui.module.css';
import styles from './CollectionPage.module.css';

interface CollectionPageProps {
  games: Game[];
  hidden: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onOpenGame: (game: Game, opener: HTMLButtonElement) => void;
  onAddGame: (opener: HTMLButtonElement) => void;
  onRemoveDemo: () => boolean;
  onImport: (file: File) => void;
}

export function CollectionPage({
  games,
  hidden,
  headingRef,
  onOpenGame,
  onAddGame,
  onRemoveDemo,
  onImport,
}: CollectionPageProps) {
  const addButton = useRef<HTMLButtonElement>(null);
  const importInput = useRef<HTMLInputElement>(null);

  return (
    <section id="collection" aria-labelledby="collection-title" hidden={hidden}>
      <div className={`${ui.sectionHeading} ${styles.collectionHeading}`}>
        <h1 className={ui.pageTitle} id="collection-title" ref={headingRef} tabIndex={-1}>
          Коллекция
        </h1>
        <div className={styles.collectionActions}>
          <button
            className={`${ui.button} ${ui.secondary}`}
            type="button"
            onClick={() => importInput.current?.click()}
          >
            Перенести из старой версии
          </button>
          <input
            ref={importInput}
            hidden
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) onImport(file);
            }}
          />
          <button
            ref={addButton}
            className={`${ui.button} ${ui.primary}`}
            type="button"
            onClick={(event) => onAddGame(event.currentTarget)}
          >
            + Добавить игру
          </button>
        </div>
      </div>
      {games.some((game) => game.demo) && (
        <div className={`${ui.notice} ${ui.noticeRow}`}>
          <p>
            Здесь есть демоигры. Откройте карточку, чтобы оставить игру в своей коллекции или
            изменить её.
          </p>
          <button
            className={`${ui.button} ${ui.secondary}`}
            type="button"
            onClick={() => {
              if (window.confirm('Убрать все демоигры из коллекции?') && onRemoveDemo())
                addButton.current?.focus();
            }}
          >
            Убрать демоигры
          </button>
        </div>
      )}
      {games.length ? (
        <ul className={ui.cardGrid} role="list">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              heading="h2"
              description={lastPlayedLabel(game)}
              onOpen={onOpenGame}
            />
          ))}
        </ul>
      ) : (
        <p className={ui.empty}>Коллекция пуста. Добавьте первую настолку.</p>
      )}
    </section>
  );
}
