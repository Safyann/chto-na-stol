import { useEffect, useRef, useState } from 'react';

export function useAppUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const activating = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    const workers = navigator.serviceWorker;
    const listeners = new AbortController();
    const { signal } = listeners;
    let registration: ServiceWorkerRegistration | undefined;

    function checkWaiting() {
      if (!signal.aborted && workers.controller && registration?.waiting) {
        setWaiting(registration.waiting);
      }
    }

    function watchInstall() {
      registration?.installing?.addEventListener('statechange', checkWaiting, { signal });
    }

    workers.addEventListener(
      'controllerchange',
      () => {
        if (activating.current) window.location.reload();
        else setWaiting(null);
      },
      { signal },
    );

    void workers
      .register('./sw.js')
      .then((result) => {
        if (signal.aborted) return;
        registration = result;
        result.addEventListener('updatefound', watchInstall, { signal });
        watchInstall();
        checkWaiting();
      })
      .catch((error) => console.error('Не удалось включить офлайн-режим', error));

    return () => listeners.abort();
  }, []);

  return {
    updateAvailable: Boolean(waiting),
    requestUpdate() {
      if (!waiting) return;
      activating.current = true;
      waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
    },
  };
}
