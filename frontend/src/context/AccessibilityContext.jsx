import React, { createContext, useState } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);

  const increaseFont = () => setFontSize((size) => Math.min(size + 2, 28));
  const decreaseFont = () => setFontSize((size) => Math.max(size - 2, 12));
  const resetFont = () => setFontSize(16);
  const toggleDarkMode = () => setDarkMode((mode) => !mode);

  return (
    <AccessibilityContext.Provider value={{ fontSize, increaseFont, decreaseFont, resetFont, darkMode, toggleDarkMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}; 