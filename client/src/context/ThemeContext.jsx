import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Read from localStorage on first load
    const stored = localStorage.getItem('fds_theme');
    return stored ? stored === 'dark' : true;
  });

  // Apply to body whenever dark changes
  useEffect(() => {
    document.body.style.background = dark ? '#0d0f12' : '#f4f5f7';
    document.body.style.color = dark ? '#e8e8e8' : '#111';
    localStorage.setItem('fds_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
