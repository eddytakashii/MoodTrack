import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types/mood';
import { ApiService } from '../utils/api';

interface AuthContextType {
  usuario: (Omit<User, 'senhaHash'> | null);
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  token: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Omit<User, 'senhaHash'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar token ao iniciar
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await ApiService.getToken();
        const savedUser = await AsyncStorage.getItem('@mood_tracker_user');
        
        if (savedToken) {
          setToken(savedToken);
          
          // Se tem token mas não tem usuário salvo, buscar do backend
          if (!savedUser) {
            try {
              const response = await ApiService.getMe();
              setUsuario(response.usuario);
              // Salvar localmente para próximas inicializações
              await AsyncStorage.setItem('@mood_tracker_user', JSON.stringify(response.usuario));
            } catch (meError: any) {
              console.error('Erro ao buscar usuário do backend:', meError.message || meError);
              // Se falhar, pode estar token expirado, limpar
              await ApiService.clearToken();
              setToken(null);
            }
          } else {
            setUsuario(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar token:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreToken();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      const response: AuthResponse = await ApiService.login(email, senha);
      setToken(response.token);
      setUsuario(response.usuario);
      await ApiService.setToken(response.token);
      // Persistir usuário para restaurar na inicialização
      try {
        await AsyncStorage.setItem('@mood_tracker_user', JSON.stringify(response.usuario));
      } catch (err) {
        console.warn('Não foi possível salvar usuário localmente:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    setLoading(true);
    try {
      const response: AuthResponse = await ApiService.register(nome, email, senha);
      setToken(response.token);
      setUsuario(response.usuario);
      await ApiService.setToken(response.token);
      // Persistir usuário
      try {
        await AsyncStorage.setItem('@mood_tracker_user', JSON.stringify(response.usuario));
      } catch (err) {
        console.warn('Não foi possível salvar usuário localmente:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await ApiService.clearToken();
      setToken(null);
      setUsuario(null);
      try {
        await AsyncStorage.removeItem('@mood_tracker_user');
      } catch (err) {
        console.warn('Erro ao remover usuário local:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
