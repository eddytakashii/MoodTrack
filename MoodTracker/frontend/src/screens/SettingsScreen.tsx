import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storageService } from '../utils/storage';
import { MoodEntry } from '../types/mood';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsScreen() {
  const [totalEntries, setTotalEntries] = useState(0);
  const { colors } = useContext(ThemeContext);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const moods = await storageService.getAllMoods();
      setTotalEntries(moods.length);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Atenção',
      'Deseja realmente deletar todos os registros? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar Tudo',
          onPress: async () => {
            try {
              await storageService.clearAllMoods();
              setTotalEntries(0);
              Alert.alert('Sucesso', 'Todos os registros foram deletados');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar os registros');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.statsContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estatísticas</Text>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total de Registros</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{totalEntries}</Text>
          </View>
        </View>

        <View style={[styles.infoContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre o App</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Versão: </Text>
            1.0.0
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Desenvolvido por: </Text>
            Mood Tracker Team
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Este app foi criado para ajudá-lo a acompanhar seu humor diário e
            identificar padrões em sua saúde mental.
          </Text>
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={[styles.deleteAllButton, { backgroundColor: colors.error }]}
            onPress={handleClearAll}
          >
            <Text style={styles.deleteAllButtonText}>Deletar Todos os Dados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  dangerZone: {
    marginTop: 'auto',
  },
  deleteAllButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
