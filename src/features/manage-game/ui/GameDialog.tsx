import { Fragment, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import {
  gameMeta,
  getQuickGuide,
  lastPlayedLabel,
  noteFields,
  type Game,
} from '../../../entities/game';
import { localDate } from '../../../shared/lib/date';
import ui from '../../../shared/ui/ui.module.css';
import styles from './GameDialog.module.css';

interface GameDialogProps {
  game?: Game;
  onDismiss: () => void;
  onSave: (game: Game) => boolean;
  onMarkPlayed: (game: Game, selectedExpansions: string[]) => boolean;
  onRemove: (game: Game) => boolean;
}

const noteKeys = Object.keys(noteFields) as (keyof typeof noteFields)[];

export function GameDialog({ game, onDismiss, onSave, onMarkPlayed, onRemove }: GameDialogProps) {
  const [editing, setEditing] = useState(!game);
  const [saveFailed, setSaveFailed] = useState(false);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const maxPlayersInput = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    if (editing) titleInput.current?.focus();
    else heading.current?.focus();
  }, [editing]);

  function clearValidity() {
    titleInput.current?.setCustomValidity('');
    maxPlayersInput.current?.setCustomValidity('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const title = String(fields.get('title')).trim();
    const minPlayers = Number(fields.get('minPlayers'));
    const maxPlayers = Number(fields.get('maxPlayers'));
    if (!title) {
      titleInput.current?.setCustomValidity('Введите название игры.');
      form.reportValidity();
      return;
    }
    if (maxPlayers < minPlayers) {
      maxPlayersInput.current?.setCustomValidity(
        'Максимум игроков должен быть не меньше минимума.',
      );
      form.reportValidity();
      return;
    }

    const lastPlayed = String(fields.get('lastPlayed'));
    const expansionNames = String(fields.get('expansions'))
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean);
    const saved = onSave({
      ...game,
      id: game?.id ?? `game-${crypto.randomUUID()}`,
      title,
      minPlayers,
      maxPlayers,
      minutes: Number(fields.get('minutes')),
      beginners: fields.has('beginners'),
      lastPlayed,
      expansions: [...new Set(expansionNames)],
      lastPlayedExpansions: lastPlayed === game?.lastPlayed ? game.lastPlayedExpansions : undefined,
      notes: Object.fromEntries(noteKeys.map((key) => [key, String(fields.get(key)).trim()])),
    });
    if (saved) onDismiss();
    else setSaveFailed(true);
  }

  function remove() {
    if (!game || !window.confirm(`Удалить «${game.title}» из коллекции?`)) return;
    if (onRemove(game)) onDismiss();
    else setSaveFailed(true);
  }

  const title = editing ? (game ? 'Редактировать игру' : 'Добавить игру') : game?.title;
  const expansions = game?.expansions ?? [];
  const guide = game ? getQuickGuide(game) : undefined;
  const personalNotes = game && noteKeys.some((key) => game.notes[key]) ? game.notes : undefined;
  const lastPlayedExpansions = game?.lastPlayedExpansions;
  const showLastPlayedExpansions =
    game?.lastPlayed &&
    lastPlayedExpansions &&
    (expansions.length > 0 || lastPlayedExpansions.length > 0);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="game-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className={styles.dialogHeading}>
        <h2 ref={heading} id="game-dialog-title" tabIndex={-1}>
          {title}
        </h2>
        <button
          className={styles.closeDialog}
          type="button"
          aria-label="Закрыть"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>

      {editing && (
        <form className={styles.form} onInput={clearValidity} onSubmit={submit}>
          <label className={ui.field}>
            Название{' '}
            <input
              ref={titleInput}
              name="title"
              maxLength={80}
              required
              defaultValue={game?.title}
            />
          </label>
          <div className={styles.formColumns}>
            <label className={ui.field}>
              Мин. игроков{' '}
              <input
                name="minPlayers"
                type="number"
                min={1}
                max={100}
                required
                defaultValue={game?.minPlayers}
              />
            </label>
            <label className={ui.field}>
              Макс. игроков{' '}
              <input
                ref={maxPlayersInput}
                name="maxPlayers"
                type="number"
                min={1}
                max={100}
                required
                defaultValue={game?.maxPlayers}
              />
            </label>
            <label className={ui.field}>
              Партия, мин{' '}
              <input
                name="minutes"
                type="number"
                min={1}
                max={1440}
                required
                defaultValue={game?.minutes}
              />
            </label>
          </div>
          <label className={ui.check}>
            <input name="beginners" type="checkbox" defaultChecked={game?.beginners} /> Подходит
            новичкам
          </label>
          <label className={ui.field}>
            Последняя партия{' '}
            <input
              name="lastPlayed"
              type="date"
              max={localDate()}
              defaultValue={game?.lastPlayed}
            />
          </label>
          <div className={ui.field}>
            <label htmlFor="game-expansions">Дополнения</label>
            <small id="expansions-hint" className={styles.hint}>
              Одно название на строку.
            </small>
            <textarea
              id="game-expansions"
              name="expansions"
              rows={2}
              maxLength={1200}
              aria-describedby="expansions-hint"
              defaultValue={expansions.join('\n')}
            />
          </div>
          <fieldset>
            <legend>Шпаргалка</legend>
            {noteKeys.map((key) => (
              <label className={ui.field} key={key}>
                {noteFields[key]}{' '}
                <textarea name={key} maxLength={600} rows={2} defaultValue={game?.notes[key]} />
              </label>
            ))}
          </fieldset>
          <div className={styles.dialogActions}>
            <button className={`${ui.button} ${ui.primary}`} type="submit">
              Сохранить
            </button>
            {game && (
              <button
                className={`${ui.button} ${ui.secondary} ${ui.danger}`}
                type="button"
                onClick={remove}
              >
                Удалить игру
              </button>
            )}
          </div>
        </form>
      )}

      {!editing && game && (
        <div className={styles.details}>
          <p className={styles.gameMeta}>
            {gameMeta(game)} · {game.beginners ? 'Подходит новичкам' : 'Для опытных игроков'}
          </p>
          {game.sourceUrl && (
            <p className={styles.gameMeta}>
              <a href={game.sourceUrl} target="_blank" rel="noreferrer">
                Карточка игры на сайте
              </a>
            </p>
          )}
          <div aria-live="polite">
            <p>{lastPlayedLabel(game)}</p>
            {showLastPlayedExpansions && (
              <p className={styles.gameMeta}>
                {lastPlayedExpansions.length
                  ? `С дополнениями: ${lastPlayedExpansions.join(', ')}`
                  : 'Без дополнений'}
              </p>
            )}
          </div>
          {guide && (
            <section aria-labelledby="guide-title">
              <h3 id="guide-title">Быстрый старт</h3>
              <p className={styles.hint}>Базовая игра</p>
              <dl>
                {noteKeys.map((key) => (
                  <Fragment key={key}>
                    <dt>{noteFields[key]}</dt>
                    <dd>{guide.notes[key]}</dd>
                  </Fragment>
                ))}
              </dl>
              <p className={styles.rulesLink}>
                <a href={guide.rulesUrl} target="_blank" rel="noreferrer">
                  Полные правила и схемы
                </a>
              </p>
            </section>
          )}
          {(personalNotes || !guide) && (
            <section aria-labelledby="notes-title">
              <h3 id="notes-title">Мои заметки</h3>
              {personalNotes ? (
                <dl>
                  {noteKeys.map(
                    (key) =>
                      personalNotes[key] && (
                        <Fragment key={key}>
                          <dt>{noteFields[key]}</dt>
                          <dd>{personalNotes[key]}</dd>
                        </Fragment>
                      ),
                  )}
                </dl>
              ) : (
                <p>Добавьте заметки о подготовке, первом ходе и правиле, которое легко забыть.</p>
              )}
            </section>
          )}
          {expansions.length > 0 && (
            <fieldset className={styles.expansionPicker}>
              <legend>Дополнения на эту партию</legend>
              <p className={styles.hint}>Для базовой игры оставьте флажки пустыми.</p>
              {expansions.map((name) => (
                <label className={ui.check} key={name}>
                  <input
                    type="checkbox"
                    checked={selectedExpansions.includes(name)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setSelectedExpansions((current) =>
                        checked ? [...current, name] : current.filter((item) => item !== name),
                      );
                    }}
                  />
                  {name}
                </label>
              ))}
            </fieldset>
          )}
          <div className={styles.dialogActions}>
            <button
              className={`${ui.button} ${ui.primary}`}
              type="button"
              onClick={() => setSaveFailed(!onMarkPlayed(game, selectedExpansions))}
            >
              Сыграли
            </button>
            <button
              className={`${ui.button} ${ui.secondary}`}
              type="button"
              onClick={() => setEditing(true)}
            >
              Редактировать
            </button>
          </div>
        </div>
      )}
      {saveFailed && (
        <p className={`${ui.notice} ${styles.saveError}`} role="alert">
          Не удалось сохранить изменения. Проверьте настройки браузера и попробуйте ещё раз.
        </p>
      )}
    </dialog>
  );
}
