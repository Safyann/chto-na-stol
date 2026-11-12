import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadCollection } from '../entities/game';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Отсутствует контейнер приложения');

createRoot(root).render(
  <StrictMode>
    <App {...loadCollection()} />
  </StrictMode>,
);
