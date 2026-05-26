import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  card: string;
  shadow: string;
  disabled: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  colors: ThemeColors;
}

export const lightTheme: ThemeColors = {
  primary: '#4CAF50',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#999999',
  border: '#EEEEEE',
  error: '#FF5252',
  warning: '#FF9800',
  success: '#4CAF50',
  card: '#FFFFFF',
  shadow: '#000000',
  disabled: '#CCCCCC',
};

export const darkTheme: ThemeColors = {
  primary: '#66BB6A',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#BBBBBB',
  border: '#2E2E2E',
  error: '#FF6B6B',
  warning: '#FFB74D',
  success: '#66BB6A',
  card: '#1E1E1E',
  shadow: '#000000',
  disabled: '#555555',
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: async () => {},
  colors: lightTheme,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Restaurar tema ao iniciar
  useEffect(() => {
    const restoreTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@mood_tracker_theme');
        if (savedTheme) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.error('Erro ao restaurar tema:', error);
      }
    };

    restoreTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@mood_tracker_theme', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [isDarkMode]);

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
