import React, { useState } from 'react';

const Accessibility = () => {
  const [highContrast, setHighContrast] = useState(false);

  return (
    <main
      style={{
        background: highContrast ? '#000' : '#fff',
        color: highContrast ? '#fff' : '#222',
        minHeight: '100vh',
        padding: '1rem'
      }}
    >
      <h1 tabIndex="0">Accessibilité</h1>
      <button
        onClick={() => setHighContrast(!highContrast)}
        aria-pressed={highContrast}
        style={{ marginBottom: '1rem' }}
      >
        {highContrast ? 'Mode normal' : 'Contraste élevé'}
      </button>
      <section>
        <h2>Fonctionnalités d'accessibilité</h2>
        <ul>
          <li>Navigation au clavier (Tab, Shift+Tab, Entrée)</li>
          <li>Contraste élevé pour les personnes malvoyantes</li>
          <li>Polices lisibles et tailles adaptables</li>
          <li>Compatibilité avec les lecteurs d'écran (VoiceOver, NVDA, JAWS...)</li>
          <li>Labels ARIA sur tous les éléments interactifs</li>
        </ul>
      </section>
      <section>
        <h2>Raccourcis clavier</h2>
        <ul>
          <li><b>Tab</b> : Naviguer entre les éléments interactifs</li>
          <li><b>Entrée</b> : Activer un bouton ou un lien</li>
          <li><b>Ctrl + +</b> / <b>Ctrl + -</b> : Agrandir/réduire la taille du texte</li>
        </ul>
      </section>
      <section>
        <h2>Conseils d'utilisation</h2>
        <ul>
          <li>Utilisez le bouton "Contraste élevé" pour améliorer la visibilité.</li>
          <li>Utilisez un lecteur d'écran pour lire les contenus si besoin.</li>
          <li>Contactez l'équipe technique si vous rencontrez des difficultés d'accès.</li>
        </ul>
      </section>
    </main>
  );
};

export default Accessibility; 