import { useRef, useState, type FormEvent, type Ref } from 'react';
import { GameCard, type Game } from '../../../entities/game';
import ui from '../../../shared/ui/ui.module.css';
import {
  explainMatch,
  initialCriteria,
  recommendGames,
  type Criteria,
} from '../model/recommendGames';
import styles from './SelectionPage.module.css';

interface SelectionPageProps {
  hidden: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  games: Game[];
  onOpenGame: (game: Game, opener: HTMLButtonElement) => void;
}

export function SelectionPage({ hidden, headingRef, games, onOpenGame }: SelectionPageProps) {
  const [criteria, setCriteria] = useState(initialCriteria);
  const [prioritizeOld, setPrioritizeOld] = useState(false);
  const [message, setMessage] = useState('');
  const playersInput = useRef<HTMLInputElement>(null);
  const resultsTitle = useRef<HTMLHeadingElement>(null);
  const suggestions = recommendGames(games, criteria, prioritizeOld);

  function applyFilters(nextCriteria: Criteria, nextPrioritizeOld: boolean) {
    setCriteria(nextCriteria);
    setPrioritizeOld(nextPrioritizeOld);
    const count = recommendGames(games, nextCriteria, nextPrioritizeOld).length;
    setMessage(count ? `Игр в подборке — ${count}.` : 'Подходящих игр нет.');
  }

  function changePlayerCount(step: number) {
    const input = playersInput.current;
    if (!input) return;
    const count = (input.valueAsNumber || criteria.players) + step;
    input.valueAsNumber = Math.min(Number(input.max), Math.max(Number(input.min), count));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    applyFilters(
      {
        players: Number(fields.get('players')),
        minutes: Number(fields.get('minutes')),
        beginners: fields.has('beginners'),
      },
      prioritizeOld,
    );
    resultsTitle.current?.focus();
  }

  return (
    <section id="selection" aria-labelledby="selection-title" hidden={hidden}>
      <p className={ui.visuallyHidden} role="status">
        {message}
      </p>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={ui.pageTitle} id="selection-title" ref={headingRef} tabIndex={-1}>
            Во что сыграем?
          </h1>
          <p>Подберите настолку из своей коллекции под компанию и время.</p>
        </div>
        <div className={styles.tableArt} aria-hidden="true">
          <span className={`${styles.tableCard} ${styles.tableCardBack}`} />
          <span className={`${styles.tableCard} ${styles.tableCardFront}`}>
            <i />
          </span>
          <span className={styles.tableDie}>⚄</span>
          <span className={styles.tableToken} />
          <span className={`${styles.tableToken} ${styles.tableTokenSmall}`} />
        </div>
      </div>

      <form className={styles.criteria} onSubmit={submit}>
        <div className={ui.field}>
          <label htmlFor="players">Игроков</label>
          <div className={styles.stepper}>
            <button type="button" aria-label="Убавить игрока" onClick={() => changePlayerCount(-1)}>
              −
            </button>
            <input
              ref={playersInput}
              id="players"
              name="players"
              type="number"
              min={1}
              max={100}
              defaultValue={initialCriteria.players}
              required
            />
            <button type="button" aria-label="Добавить игрока" onClick={() => changePlayerCount(1)}>
              +
            </button>
          </div>
        </div>
        <label className={ui.field}>
          Время, мин{' '}
          <input
            name="minutes"
            type="number"
            min={1}
            max={1440}
            defaultValue={initialCriteria.minutes}
            required
          />
        </label>
        <label className={`${ui.check} ${styles.criteriaCheck}`}>
          <input name="beginners" type="checkbox" defaultChecked={initialCriteria.beginners} /> Есть
          новички
        </label>
        <button className={`${ui.button} ${ui.primary} ${styles.submit}`} type="submit">
          Подобрать игры <span aria-hidden="true">→</span>
        </button>
      </form>

      <section className={styles.results} aria-labelledby="results-title">
        <div className={`${ui.sectionHeading} ${styles.resultsHeading}`}>
          <h2 className={styles.sectionTitle} id="results-title" ref={resultsTitle} tabIndex={-1}>
            На стол
          </h2>
          <label className={`${ui.check} ${styles.rotation}`}>
            <input
              type="checkbox"
              checked={prioritizeOld}
              onChange={(event) => applyFilters(criteria, event.currentTarget.checked)}
            />{' '}
            Давно не играли
          </label>
        </div>
        {suggestions.length ? (
          <ul className={ui.cardGrid} role="list">
            {suggestions.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                heading="h3"
                description={explainMatch(game, criteria, prioritizeOld)}
                onOpen={onOpenGame}
              />
            ))}
          </ul>
        ) : (
          <p className={ui.empty}>
            {!games.length ? (
              <>
                <a href="#collection">Добавьте игру в коллекцию</a>, чтобы получить подборку.
              </>
            ) : (
              'Подходящих игр нет. Попробуйте изменить условия подбора.'
            )}
          </p>
        )}
      </section>
    </section>
  );
}
