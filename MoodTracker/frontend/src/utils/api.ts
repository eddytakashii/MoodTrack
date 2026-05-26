import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.107:3000';

export class ApiService {
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@mood_tracker_token');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@mood_tracker_token', token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }

  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@mood_tracker_token');
    } catch (error) {
      console.error('Erro ao limpar token:', error);
    }
  }

  static async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requiresAuth) {
        const token = await this.getToken();
        if (!token) {
          throw new Error('Não autenticado');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        let errorBody: any = {};
        
        try {
          errorBody = await response.json();
          // Extrair mensagem simples do backend
          if (errorBody.erro) {
            errorMessage = errorBody.erro;
          }
        } catch (e) {
          // Se não conseguir fazer parse, usar status code
        }
        
        // Verificar se é erro de autenticação
        if (response.status === 401) {
          // Se for uma rota que requer autenticação, significa sessão expirada
          if (requiresAuth) {
            await this.clearToken();
            throw new Error('Sessão expirada');
          }
          // Se for login/registro (requiresAuth=false), usar a mensagem do backend
          // que já foi extraída acima (ex: "Email ou senha inválidos")
        }
        
        throw new Error(errorMessage);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      throw error;
    }
  }

  // ===== AUTH =====
  static async register(nome: string, email: string, senha: string): Promise<any> {
    return this.request('POST', '/auth/register', { nome, email, senha }, false);
  }

  static async login(email: string, senha: string): Promise<any> {
    // Limpar espaços e normalizar email
    const emailNormalizado = email.trim().toLowerCase();
    return this.request('POST', '/auth/login', { email: emailNormalizado, senha }, false);
  }

  static async getMe(): Promise<any> {
    return this.request('GET', '/auth/me');
  }

  static async deleteAccount(): Promise<any> {
    return this.request('DELETE', '/auth/delete-account');
  }

  // ===== MOOD =====
  static async saveMood(humor: string, comentario?: string): Promise<any> {
    return this.request('POST', '/mood', { humor, comentario });
  }

  static async getUserMoods(userId: string): Promise<any> {
    return this.request('GET', `/mood/user/${userId}`);
  }

  static async deleteMood(id: string): Promise<any> {
    return this.request('DELETE', `/mood/${id}`);
  }

  // ===== ENVIRONMENT =====
  static async postEnvironmentData(temperatura: number, luminosidade: number, ruido: number): Promise<any> {
    return this.request('POST', '/environment', { temperatura, luminosidade, ruido }, false);
  }

  static async getLatestEnvironmentData(): Promise<any> {
    return this.request('GET', '/environment/latest');
  }

  static async getCurrentEnvironmentData(): Promise<any> {
    return this.request('GET', '/environment/current');
  }

  // ===== ALERTS =====
  static async getAlerts(): Promise<any> {
    return this.request('GET', '/alerts');
  }

  static async createAlert(tipo: string, mensagem: string, userId?: string): Promise<any> {
    return this.request('POST', '/alerts', { tipo, mensagem, userId });
  }
}
