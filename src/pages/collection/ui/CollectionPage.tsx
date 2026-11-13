import { useRef, useState, type Ref } from 'react';
import { GameCard, lastPlayedLabel, type Game } from '../../../entities/game';
import ui from '../../../shared/ui/ui.module.css';
import { searchGames } from '../model/searchGames';
import styles from './CollectionPage.module.css';

interface CollectionPageProps {
  games: Game[];
  hidden: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onOpenGame: (game: Game, opener: HTMLButtonElement) => void;
  onAddGame: (opener: HTMLButtonElement) => void;
  onImport: (file: File) => void;
}

export function CollectionPage({
  games,
  hidden,
  headingRef,
  onOpenGame,
  onAddGame,
  onImport,
}: CollectionPageProps) {
  const importInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const visibleGames = searchGames(games, query);

  function clearSearch() {
    setQuery('');
    searchInput.current?.focus();
  }

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
            Импортировать коллекцию
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
            className={`${ui.button} ${ui.primary}`}
            type="button"
            onClick={(event) => onAddGame(event.currentTarget)}
          >
            + Добавить игру
          </button>
        </div>
      </div>
      {games.length > 0 && (
        <search className={styles.search} aria-label="Поиск по коллекции">
          <label className={ui.field}>
            Поиск по коллекции
            <input
              ref={searchInput}
              type="search"
              value={query}
              placeholder="Название игры или дополнения"
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          {query && (
            <button className={`${ui.button} ${ui.secondary}`} type="button" onClick={clearSearch}>
              Очистить
            </button>
          )}
          <p className={styles.searchStatus} role="status">
            {query
              ? `Найдено: ${visibleGames.length} из ${games.length}`
              : `Игр в коллекции: ${games.length}`}
          </p>
        </search>
      )}
      {visibleGames.length > 0 && (
        <ul className={ui.cardGrid} role="list">
          {visibleGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              heading="h2"
              description={lastPlayedLabel(game)}
              onOpen={onOpenGame}
            />
          ))}
        </ul>
      )}
      {games.length === 0 && <p className={ui.empty}>Коллекция пуста. Добавьте первую настолку.</p>}
      {games.length > 0 && visibleGames.length === 0 && (
        <p className={ui.empty}>Ничего не найдено. Попробуйте изменить запрос.</p>
      )}
    </section>
  );
}
