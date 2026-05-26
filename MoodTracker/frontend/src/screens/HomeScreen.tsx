import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MoodType } from '../types/mood';
import { MOOD_TABLER_ICONS, MOOD_LABELS, MOOD_COLORS } from '../types/mood';
import { ApiService } from '../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storageService } from '../utils/storage';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const moodIcons: Record<MoodType, string> = {
  'feliz': 'emoticon-happy',
  'neutro': 'emoticon-neutral',
  'ansioso': 'emoticon-sad',
  'cansado': 'bed',
};

interface MoodButtonProps {
  mood: MoodType;
  selected: boolean;
  onPress: (mood: MoodType) => void;
  colors: any;
}

function MoodButton({ mood, selected, onPress, colors }: MoodButtonProps) {
  const iconName = moodIcons[mood];
  
  return (
    <TouchableOpacity
      style={[
        styles.moodButton,
        {
          borderColor: MOOD_COLORS[mood],
          backgroundColor: selected ? MOOD_COLORS[mood] : colors.surface,
        },
      ]}
      onPress={() => onPress(mood)}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={40}
        color={selected ? '#FFF' : MOOD_COLORS[mood]}
        style={{ marginBottom: 5 }}
      />
      <Text style={[styles.moodLabel, { color: selected ? '#FFF' : colors.text }, selected && styles.moodLabelSelected]}>
        {MOOD_LABELS[mood]}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { colors } = useContext(ThemeContext);
  const { usuario } = useContext(AuthContext);

  const moods: MoodType[] = ['feliz', 'neutro', 'ansioso', 'cansado'];

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Atenção', 'Por favor, selecione um humor');
      return;
    }

    setLoading(true);

    // Salvar localmente com ID temporário para resposta imediata
    const localId = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const localEntry = {
      id: localId,
      userId: '',
      humor: selectedMood,
      comentario: comentario || null,
      dataHora: new Date().toISOString(),
    };

    try {
      await storageService.addMoodEntry(localEntry as any);
    } catch (err) {
      console.warn('Falha ao salvar localmente antes do envio:', err);
    }

    try {
      const response = await ApiService.saveMood(selectedMood, comentario || undefined);

      // Reconciliar: substituir o registro local pelo registro retornado pelo servidor
      try {
        await storageService.updateMoodEntry(localId, {
          id: response.id,
          userId: response.userId,
          humor: response.humor,
          comentario: response.comentario || null,
          dataHora: response.dataHora,
        });
      } catch (err) {
        console.warn('Não foi possível reconciliar localmente:', err);
      }

      Alert.alert('Sucesso', 'Humor registrado com sucesso!');
      setSelectedMood(null);
      setComentario('');
    } catch (error) {
      // Se envio falhar, mantemos a entrada local (sync pendente)
      console.error('Erro ao enviar para backend, mantido localmente:', error);
      Alert.alert('Salvo localmente', 'Registro salvo localmente e será sincronizado quando possível.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Como você está se sentindo?</Text>

        <View style={styles.moodGrid}>
          {moods.map((mood) => (
            <MoodButton
              key={mood}
              mood={mood}
              selected={selectedMood === mood}
              onPress={() => setSelectedMood(mood)}
              colors={colors}
            />
          ))}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>O que aconteceu hoje? (Opcional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Descreva seu dia..."
            placeholderTextColor={colors.textSecondary}
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: selectedMood ? MOOD_COLORS[selectedMood] : colors.disabled,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSaveMood}
          disabled={!selectedMood || loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  moodButton: {
    width: '22%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 3,
    marginBottom: 15,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#FFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
