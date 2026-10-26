import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './app/compositionRoot';
import './ui/theme/fonts';
import './ui/theme/tokens.css';
import './ui/theme/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
