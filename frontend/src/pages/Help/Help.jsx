import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

const Help = () => (
  <main style={{ maxWidth: 800, margin: 'auto', padding: '1rem' }}>
    <h1 tabIndex="0"><FaQuestionCircle style={{verticalAlign: 'middle', marginRight: 8}} />Aide & Guide utilisateur</h1>
    <section>
      <h2>Comment utiliser l'application ?</h2>
      <ul>
        <li>Utilisez le menu en haut pour naviguer entre l'accueil, le dashboard et l'accessibilité.</li>
        <li>Dans le dashboard, filtrez les prédictions par année et par mois grâce aux menus déroulants.</li>
        <li>Le tableau sous le graphique vous permet de voir les données détaillées et de les filtrer.</li>
        <li>Activez le contraste élevé si besoin pour une meilleure visibilité.</li>
        <li>Passez la souris sur les éléments pour obtenir des infobulles d'aide.</li>
      </ul>
    </section>
    <section>
      <h2>Accessibilité</h2>
      <ul>
        <li>Navigation au clavier : utilisez Tab et Entrée pour naviguer et activer les boutons/liens.</li>
        <li>Compatibilité avec les lecteurs d'écran (VoiceOver, NVDA, JAWS...)</li>
        <li>Contraste élevé disponible sur toutes les pages.</li>
      </ul>
    </section>
    <section>
      <h2>Questions fréquentes</h2>
      <ul>
        <li><b>Comment voir les prédictions ?</b> — Rendez-vous sur le Dashboard, choisissez l'année et le mois, et consultez le graphique et le tableau.</li>
        <li><b>Comment changer la langue ?</b> — (À adapter si tu ajoutes la fonctionnalité plus tard)</li>
        <li><b>Que faire si je ne comprends pas un graphique ?</b> — Passe la souris sur les éléments ou consulte la légende et les infobulles.</li>
      </ul>
    </section>
    <section>
      <h2>Besoin d'aide supplémentaire ?</h2>
      <p>Contactez l'équipe technique ou consultez la documentation fournie.</p>
    </section>
  </main>
);

export default Help; 