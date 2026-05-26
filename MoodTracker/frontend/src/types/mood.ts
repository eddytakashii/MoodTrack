// ===== TIPOS DE AUTENTICAÇÃO =====
export interface User {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: 'user' | 'admin';
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuthResponse {
  token: string;
  usuario: Omit<User, 'senhaHash'>;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}

// ===== TIPOS DE HUMOR =====
export type MoodType = 'feliz' | 'neutro' | 'ansioso' | 'cansado';

export interface MoodEntry {
  id: string;
  userId: string;
  humor: MoodType;
  comentario?: string;
  dataHora: string; // ISO 8601
}

export interface MoodStats {
  totalEntries: number;
  mediaSemanal: number;
  humorMaisFrequente: MoodType;
  ultimoRegistro?: MoodEntry;
}

// ===== TIPOS DE DADOS AMBIENTAIS =====
export interface EnvironmentData {
  id: string;
  temperatura: number; // Celsius
  luminosidade: number; // 0-100
  ruido: number; // dB
  dataHora: string; // ISO 8601
}

// ===== TIPOS DE ALERTAS =====
export type AlertType = 'temperatura' | 'luminosidade' | 'ruido' | 'bem_estar';

export interface Alert {
  id: string;
  tipo: AlertType;
  mensagem: string;
  dataHora: string;
  userId?: string; // Opcional, pode estar vinculado a um usuário
  lido: boolean;
}

// ===== CONSTANTES DE HUMOR =====
export const MOOD_EMOJIS: Record<MoodType, string> = {
  'feliz': '😊',
  'neutro': '😐',
  'ansioso': '😰',
  'cansado': '😴',
};

export const MOOD_TABLER_ICONS: Record<MoodType, string> = {
  'feliz': 'mood-smile',
  'neutro': 'mood-neutral',
  'ansioso': 'mood-worried',
  'cansado': 'mood-sleep',
};

export const MOOD_COLORS: Record<MoodType, string> = {
  'feliz': '#6BCB77',
  'neutro': '#FFD93D',
  'ansioso': '#FF6B6B',
  'cansado': '#5B7C99',
};

export const MOOD_LABELS: Record<MoodType, string> = {
  'feliz': 'Feliz',
  'neutro': 'Neutro',
  'ansioso': 'Ansioso',
  'cansado': 'Cansado',
};

// ===== CONSTANTES DE AMBIENTE =====
export const ENVIRONMENT_ALERTS = {
  TEMPERATURE_HIGH: 'Ambiente muito quente (> 28°C)',
  TEMPERATURE_LOW: 'Ambiente muito frio (< 15°C)',
  LIGHT_DIM: 'Iluminação muito baixa',
  LIGHT_BRIGHT: 'Iluminação muito alta',
  NOISE_HIGH: 'Ruído muito alto (> 70dB)',
} as const;
