import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MoodStats, Alert, AlertType, EnvironmentData, MoodType, MoodEntry } from '../types/mood';
import { MOOD_LABELS, MOOD_COLORS } from '../types/mood';
import { storageService } from '../utils/storage';
import { ApiService } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const moodIcons: Record<MoodType, string> = {
  'feliz': 'emoticon-happy',
  'neutro': 'emoticon-neutral',
  'ansioso': 'emoticon-sad',
  'cansado': 'bed',
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [alertas, setAlertas] = useState<Alert[]>([]);
  const [ambiente, setAmbiente] = useState<EnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { usuario } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let allMoods: MoodEntry[] = [];

      if (usuario) {
        try {
          const res = await ApiService.getUserMoods(usuario.id);
          allMoods = res.registros || [];
          setStats({
            totalEntries: res.totalEntries,
            mediaSemanal: res.mediaSemanal,
            humorMaisFrequente: res.ultimoRegistro?.humor || 'neutro',
            ultimoRegistro: res.ultimoRegistro || null,
          });
        } catch (err) {
          console.warn('Falha ao carregar dashboard do backend, usando local:', err);
          allMoods = await storageService.getAllMoods();
        }
      } else {
        allMoods = await storageService.getAllMoods();
      }

      if (!usuario) {
        const sorted = allMoods.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
        const totalEntries = sorted.length;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const lastWeek = sorted.filter((m) => new Date(m.dataHora) > sevenDaysAgo);
        const mapValue = (h: string) => {
          switch (h) {
            case 'feliz': return 4;
            case 'neutro': return 2;
            case 'ansioso': return 1;
            case 'cansado': return 1;
            default: return 0;
          }
        };
        const mediaSemanal = lastWeek.length ? lastWeek.reduce((sum, it) => sum + mapValue(it.humor), 0) / lastWeek.length : 0;
        const ultimoRegistro = sorted[0] || null;
        setStats({ totalEntries, mediaSemanal, humorMaisFrequente: ultimoRegistro?.humor || 'neutro', ultimoRegistro });
      }

      // Buscar dados ambientais do backend
      if (usuario) {
        try {
          const envData = await ApiService.getCurrentEnvironmentData();
          if (envData) {
            setAmbiente({
              id: envData.id,
              temperatura: envData.temperatura || envData.temp,
              luminosidade: envData.luminosidade || envData.luz,
              ruido: envData.ruido,
              dataHora: envData.dataHora,
            });
          }
        } catch (err) {
          console.warn('Erro ao buscar dados ambientais, usando fallback:', err);
          // Fallback para dados mockados se não conseguir buscar
          setAmbiente({
            id: '1',
            temperatura: 24,
            luminosidade: 75,
            ruido: 55,
            dataHora: new Date().toISOString(),
          });
        }

        // Buscar alertas do backend
        try {
          const alertsResponse = await ApiService.getAlerts();
          let alertasData: Alert[] = [];
          
          if (alertsResponse && alertsResponse.alertas) {
            alertasData = alertsResponse.alertas;
          } else if (alertsResponse && Array.isArray(alertsResponse)) {
            alertasData = alertsResponse;
          }
          
          // Mapear tipos de alerta do backend para o formato esperado
          const mapAlertType = (tipo: string): AlertType => {
            const tipoLower = tipo?.toLowerCase() || '';
            if (tipoLower.includes('temperatura') || tipoLower === 'temp') return 'temperatura';
            if (tipoLower.includes('iluminação') || tipoLower.includes('luz') || tipoLower.includes('luminosidade')) return 'luminosidade';
            if (tipoLower.includes('ruído') || tipoLower.includes('ruido') || tipoLower.includes('noise')) return 'ruido';
            return 'bem_estar';
          };
          
          const mappedAlerts = alertasData.map((alerta: any) => ({
            id: alerta.id,
            tipo: mapAlertType(alerta.tipo) as AlertType,
            mensagem: alerta.mensagem,
            dataHora: alerta.dataHora,
            userId: alerta.userId,
            lido: alerta.lido === 1 || alerta.lido === true,
          }));
          
          setAlertas(mappedAlerts);
        } catch (err) {
          console.warn('Erro ao buscar alertas, usando fallback:', err);
          // Fallback para alertas mockados se não conseguir buscar
          setAlertas([
            {
              id: '1',
              tipo: 'temperatura',
              mensagem: 'Ambiente em temperatura ideal',
              dataHora: new Date().toISOString(),
              lido: false,
            },
          ]);
        }
      } else {
        // Se não estiver autenticado, usar dados mockados
        setAmbiente({
          id: '1',
          temperatura: 24,
          luminosidade: 75,
          ruido: 55,
          dataHora: new Date().toISOString(),
        });

        setAlertas([
          {
            id: '1',
            tipo: 'temperatura',
            mensagem: 'Ambiente em temperatura ideal',
            dataHora: new Date().toISOString(),
            lido: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmbienteStatus = () => {
    if (!ambiente) return { color: colors.textSecondary, status: 'Sem dados' };

    const problemas = [];

    if (ambiente.temperatura > 28) {
      problemas.push('Muito quente');
    } else if (ambiente.temperatura < 15) {
      problemas.push('Muito frio');
    }

    if (ambiente.luminosidade < 20) {
      problemas.push('Pouca luz');
    } else if (ambiente.luminosidade > 80) {
      problemas.push('Muita luz');
    }

    if (ambiente.ruido > 70) {
      problemas.push('Muito barulho');
    }

    if (problemas.length === 0) {
      return { color: colors.success, status: 'Ambiente ideal ✓' };
    }

    return {
      color: colors.error,
      status: `Ajustem: ${problemas.join(', ')}`,
    };
  };

  const getWellnessRecommendation = (): string => {
    if (!stats || !stats.ultimoRegistro) {
      return 'Comece a registrar seu humor!';
    }

    const { humor } = stats.ultimoRegistro;

    const recommendations: Record<string, string> = {
      feliz: 'Mantenha essa energia! Continue aproveitando o dia.',
      neutro: 'Tente se envolver em atividades que gosta.',
      ansioso: 'Respire fundo, faça uma meditação ou caminhada.',
      cansado: 'Descanse um pouco, beba água e cuide-se.',
    };

    return recommendations[humor] || 'Cuide-se bem!';
  };

  const getMediaSemanalEmoji = (): string => {
    if (!stats) return '';
    const media = stats.mediaSemanal;
    if (media >= 3) return 'emoticon-happy';
    if (media >= 2) return 'emoticon-neutral';
    return 'emoticon-sad';
  };

  const ambienteStatus = getAmbienteStatus();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>

        
        {stats?.ultimoRegistro && stats.ultimoRegistro.humor && (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Último Registro</Text>
            <View style={styles.lastMoodContainer}>
              <MaterialCommunityIcons name={moodIcons[stats.ultimoRegistro.humor as MoodType] as any} size={60} color={MOOD_COLORS[stats.ultimoRegistro.humor as MoodType]} style={{ marginRight: 15 }} />
              <View>
                <Text style={[styles.moodName, { color: colors.text }]}>
                  {MOOD_LABELS[stats.ultimoRegistro.humor as MoodType]}
                </Text>
                <Text style={[styles.moodTime, { color: colors.textSecondary }]}>
                  {new Date(stats.ultimoRegistro.dataHora).toLocaleTimeString('pt-BR')}
                </Text>
                {stats.ultimoRegistro.comentario && (
                  <Text style={[styles.moodComment, { color: colors.textSecondary }]}>
                    "{stats.ultimoRegistro.comentario}"
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        
        {stats && (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Média Semanal</Text>
            <View style={styles.weeklyStatsContainer}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name={getMediaSemanalEmoji() as any} size={40} color={colors.primary} style={styles.statEmoji} />
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.mediaSemanal.toFixed(1)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pontuação</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="chart-bar" size={40} color={colors.primary} style={styles.statEmoji} />
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalEntries}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Registros</Text>
              </View>
            </View>
          </View>
        )}

        
        <View style={[styles.card, { backgroundColor: colors.warning + '20', shadowColor: colors.shadow }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recomendação</Text>
          </View>
          <Text style={[styles.recommendationText, { color: colors.text }]}>
            {getWellnessRecommendation()}
          </Text>
        </View>

        
        {ambiente && (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Dados do Ambiente</Text>
            <View style={styles.environmentContainer}>
              <View style={styles.envItem}>
                <MaterialCommunityIcons name="thermometer" size={28} color={colors.primary} style={styles.envIcon} />
                <Text style={[styles.envValue, { color: colors.text }]}>{ambiente.temperatura}°C</Text>
                <Text style={[styles.envLabel, { color: colors.textSecondary }]}>Temperatura</Text>
              </View>
              <View style={styles.envItem}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color={colors.primary} style={styles.envIcon} />
                <Text style={[styles.envValue, { color: colors.text }]}>{ambiente.luminosidade}%</Text>
                <Text style={[styles.envLabel, { color: colors.textSecondary }]}>Luminosidade</Text>
              </View>
              <View style={styles.envItem}>
                <MaterialCommunityIcons name="volume-high" size={28} color={colors.primary} style={styles.envIcon} />
                <Text style={[styles.envValue, { color: colors.text }]}>{ambiente.ruido}dB</Text>
                <Text style={[styles.envLabel, { color: colors.textSecondary }]}>Ruído</Text>
              </View>
            </View>
            <View
              style={[
                styles.ambienteStatus,
                { backgroundColor: ambienteStatus.color + '20' },
              ]}
            >
              <Text
                style={[
                  styles.ambienteStatusText,
                  { color: ambienteStatus.color },
                ]}
              >
                {ambienteStatus.status}
              </Text>
            </View>
          </View>
        )}

        
        {alertas.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="alert-circle" size={18} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Alertas</Text>
            </View>
            {alertas.map((alerta: Alert) => (
              <View key={alerta.id} style={[styles.alertItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.alertMessage, { color: colors.text }]}>{alerta.mensagem}</Text>
                <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                  {new Date(alerta.dataHora).toLocaleTimeString('pt-BR')}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  lastMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeEmoji: {
    fontSize: 60,
    marginRight: 15,
  },
  largeIconContainer: {
    marginRight: 15,
  },
  moodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodTime: {
    fontSize: 13,
    marginBottom: 5,
  },
  moodComment: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  weeklyStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  environmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  envItem: {
    alignItems: 'center',
    flex: 1,
  },
  envIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  envValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  envLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  ambienteStatus: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ambienteStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
  },
});
