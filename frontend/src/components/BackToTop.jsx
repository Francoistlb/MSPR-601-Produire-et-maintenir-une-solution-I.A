import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return visible ? (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut de page"
      style={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        fontSize: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 1000
      }}
    >
      <FaArrowUp />
    </button>
  ) : null;
};

export default BackToTop; 