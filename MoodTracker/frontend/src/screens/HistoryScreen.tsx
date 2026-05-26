import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { MoodEntry, MoodType } from '../types/mood';
import { storageService } from '../utils/storage';
import { ApiService } from '../utils/api';
import { MOOD_LABELS, MOOD_COLORS } from '../types/mood';

const moodIcons: Record<MoodType, string> = {
  'feliz': 'emoticon-happy',
  'neutro': 'emoticon-neutral',
  'ansioso': 'emoticon-sad',
  'cansado': 'bed',
};

export default function HistoryScreen() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { usuario } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  useFocusEffect(
    useCallback(() => {
      loadMoods();
    }, [])
  );

  const loadMoods = async () => {
    setLoading(true);
    try {
      let allMoods: MoodEntry[] = [];

      if (usuario) {
        try {
          const res = await ApiService.getUserMoods(usuario.id);
          allMoods = res.registros || [];
        } catch (err) {
          console.warn('Falha ao buscar histórico do backend, usando local:', err);
          allMoods = await storageService.getAllMoods();
        }
      } else {
        allMoods = await storageService.getAllMoods();
      }
      const sorted = allMoods.sort(
        (a, b) =>
          new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      );
      setMoods(sorted);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirmar', 'Deseja deletar este registro?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            if (usuario) {
              try {
                await ApiService.deleteMood(id);
              } catch (err: any) {
                console.warn('Erro ao deletar do backend:', err);
              }
            }
            
            try {
              await storageService.deleteMoodEntry(id);
            } catch (err) {
              // Se não conseguir deletar localmente, não é crítico se já deletou no backend
              console.warn('Erro ao deletar localmente:', err);
            }
            setMoods(moods.filter(m => m.id !== id));
            Alert.alert('Sucesso', 'Registro deletado');
          } catch (error) {
            console.error('Erro ao deletar:', error);
            Alert.alert('Erro', 'Não foi possível deletar o registro');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderMoodItem = ({ item }: { item: MoodEntry }) => {
    const date = new Date(item.dataHora);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');
    const iconName = moodIcons[item.humor as MoodType];

    return (
      <View style={[styles.moodItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <View style={styles.moodItemContent}>
          <MaterialCommunityIcons name={iconName as any} size={40} color={MOOD_COLORS[item.humor as MoodType]} style={{ marginRight: 15 }} />
          <View style={styles.moodItemInfo}>
            <Text style={[styles.moodItemLabel, { color: colors.text }]}>{MOOD_LABELS[item.humor as MoodType]}</Text>
            <Text style={[styles.moodItemDate, { color: colors.textSecondary }]}>
              {formattedDate} às {formattedTime}
            </Text>
            {item.comentario && <Text style={[styles.moodItemNote, { color: colors.textSecondary }]}>{item.comentario}</Text>}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {moods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nenhum registro ainda</Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Comece a registrar seu humor!
          </Text>
        </View>
      ) : (
        <FlatList
          data={moods}
          renderItem={renderMoodItem}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadMoods}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  moodItem: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodItemInfo: {
    flex: 1,
  },
  moodItemLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodItemDate: {
    fontSize: 13,
    marginBottom: 5,
  },
  moodItemNote: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
  },
});
