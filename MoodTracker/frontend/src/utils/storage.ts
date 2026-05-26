import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types/mood';

const MOODS_STORAGE_KEY = '@mood_tracker_moods';

export const storageService = {
  async addMoodEntry(entry: MoodEntry): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem(MOODS_STORAGE_KEY);
      const moods: MoodEntry[] = existingData ? JSON.parse(existingData) : [];
      moods.push(entry);
      await AsyncStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(moods));
    } catch (error) {
      console.error('Erro ao salvar registro de humor:', error);
      throw error;
    }
  },

  async getAllMoods(): Promise<MoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(MOODS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao recuperar registros:', error);
      return [];
    }
  },

  async getMoodsForDate(date: string): Promise<MoodEntry[]> {
    try {
      const allMoods = await this.getAllMoods();
      return allMoods.filter((mood) => mood.dataHora.split('T')[0] === date);
    } catch (error) {
      console.error('Erro ao recuperar registros do dia:', error);
      return [];
    }
  },

  async getMoodsForWeek(): Promise<MoodEntry[]> {
    try {
      const allMoods = await this.getAllMoods();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return allMoods.filter((mood) => {
        const moodDate = new Date(mood.dataHora);
        return moodDate >= sevenDaysAgo;
      });
    } catch (error) {
      console.error('Erro ao recuperar registros da semana:', error);
      return [];
    }
  },

  async deleteMoodEntry(id: string): Promise<void> {
    try {
      const allMoods = await this.getAllMoods();
      const filtered = allMoods.filter((mood) => mood.id !== id);
      await AsyncStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      throw error;
    }
  },

  async updateMoodEntry(oldId: string, newEntry: MoodEntry): Promise<void> {
    try {
      const allMoods = await this.getAllMoods();
      const updated = allMoods.map((m) => (m.id === oldId ? newEntry : m));
      await AsyncStorage.setItem(MOODS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      throw error;
    }
  },

  async clearAllMoods(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOODS_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  },
};
