import React from 'react';
import { createRoot } from 'react-dom/client';

function TechnicalShell() {
  return (
    <main>
      <h1>Travel Buddy</h1>
      <p>Shell tehnic local. Funcționalitățile aplicației nu sunt încă disponibile.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TechnicalShell />
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
