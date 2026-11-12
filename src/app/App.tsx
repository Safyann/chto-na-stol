import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  mergeCollection,
  parseCollection,
  readCollection,
  saveCollection,
  type Game,
} from '../entities/game';
import { GameDialog } from '../features/manage-game';
import { CollectionPage } from '../pages/collection';
import { SelectionPage } from '../pages/selection';
import { localDate } from '../shared/lib/date';
import ui from '../shared/ui/ui.module.css';
import { useAppUpdate } from './pwa/useAppUpdate';
import styles from './App.module.css';

interface AppProps {
  games: Game[];
  storageError: boolean;
}

function currentSection() {
  return location.hash === '#collection' ? 'collection' : 'selection';
}

export function App({ games: initialGames, storageError }: AppProps) {
  const [section, setSection] = useState(currentSection);
  const [games, setGames] = useState(initialGames);
  const [dialog, setDialog] = useState<{ gameId?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(
    storageError ? 'Не удалось открыть локальное хранилище. Проверьте настройки браузера.' : '',
  );
  const { updateAvailable, requestUpdate } = useAppUpdate();
  const selectionHeading = useRef<HTMLHeadingElement>(null);
  const collectionHeading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const focusSection = useRef(false);
  const heading = section === 'selection' ? selectionHeading : collectionHeading;

  useEffect(() => {
    function navigate() {
      focusSection.current = true;
      setSection(currentSection());
    }

    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  useLayoutEffect(() => {
    if (!focusSection.current) return;
    focusSection.current = false;
    heading.current?.focus();
  }, [section, heading]);

  useLayoutEffect(() => {
    if (dialog || !opener.current) return;
    (opener.current.isConnected && !opener.current.closest('[hidden]')
      ? opener.current
      : heading.current
    )?.focus();
    opener.current = null;
  }, [dialog, heading]);

  function openDialog(button: HTMLButtonElement, gameId?: string) {
    opener.current = button;
    setDialog({ gameId });
  }

  function save(change: (current: Game[]) => Game[], status: string) {
    try {
      const nextGames = change(readCollection() ?? games);
      saveCollection(nextGames);
      setGames(nextGames);
    } catch {
      if (!dialog) setError('Не удалось сохранить изменения. Проверьте настройки браузера.');
      return false;
    }

    setError('');
    setMessage(status);
    return true;
  }

  function saveGame(game: Game) {
    return save(
      (current) =>
        dialog?.gameId
          ? current.map((item) => (item.id === game.id ? game : item))
          : [...current, game],
      `«${game.title}» сохранена в коллекции.`,
    );
  }

  function markPlayed(game: Game) {
    return save(
      (current) =>
        current.map((item) =>
          item.id === game.id ? { ...item, lastPlayed: localDate(), demo: false } : item,
        ),
      `Партия в «${game.title}» записана.`,
    );
  }

  async function importCollection(file: File) {
    try {
      const imported = parseCollection(await file.text());
      save((current) => mergeCollection(current, imported), 'Коллекция перенесена.');
    } catch {
      setError('Не удалось прочитать файл. Выберите JSON, сохранённый из старой версии.');
    }
  }

  return (
    <>
      <header className={styles.siteHeader}>
        <div className={`${styles.shell} ${styles.headerInner}`}>
          <a className={styles.brand} href="#selection">
            <span className={styles.brandMark} aria-hidden="true">
              ⚄
            </span>{' '}
            Что на стол?
          </a>
          <nav className={styles.navigation} aria-label="Разделы">
            <a href="#selection" aria-current={section === 'selection' ? 'page' : undefined}>
              Подборка
            </a>
            <a href="#collection" aria-current={section === 'collection' ? 'page' : undefined}>
              Коллекция
            </a>
          </nav>
        </div>
      </header>

      <main className={`${styles.shell} ${styles.main}`}>
        {error && (
          <p className={ui.notice} role="alert">
            {error}
          </p>
        )}
        <p className={ui.visuallyHidden} role="status">
          {message}
        </p>
        {updateAvailable && (
          <div className={`${ui.notice} ${ui.noticeRow}`}>
            <p>Доступна новая версия.</p>
            <button
              className={`${ui.button} ${ui.secondary}`}
              type="button"
              onClick={requestUpdate}
            >
              Обновить
            </button>
          </div>
        )}
        <SelectionPage
          hidden={section !== 'selection'}
          headingRef={selectionHeading}
          games={games}
          onOpenGame={(game, button) => openDialog(button, game.id)}
        />
        <CollectionPage
          games={games}
          hidden={section !== 'collection'}
          headingRef={collectionHeading}
          onOpenGame={(game, button) => openDialog(button, game.id)}
          onAddGame={openDialog}
          onRemoveDemo={() =>
            save((current) => current.filter((game) => !game.demo), 'Демоигры убраны.')
          }
          onImport={(file) => void importCollection(file)}
        />
      </main>

      {dialog && (
        <GameDialog
          game={games.find((game) => game.id === dialog.gameId)}
          onDismiss={() => setDialog(null)}
          onSave={saveGame}
          onMarkPlayed={markPlayed}
          onRemove={(game) =>
            save(
              (current) => current.filter((item) => item.id !== game.id),
              `«${game.title}» удалена из коллекции.`,
            )
          }
        />
      )}
    </>
  );
}
