import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { ApiService } from '../utils/api';

export default function ProfileScreen({ navigation }: any) {
  const { usuario, logout, isAuthenticated } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Sair',
            onPress: async () => {
          try {
            setLoading(true);
            await logout();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível fazer logout');
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deletar Conta',
      'Esta ação é IRREVERSÍVEL. Todos seus dados serão perdidos permanentemente.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
              try {
              setLoading(true);
              await ApiService.deleteAccount();
              Alert.alert('Sucesso', 'Conta deletada com sucesso');
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a conta');
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  
  if (!usuario) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.title, { color: colors.text }]}>Dados Indisponíveis</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Não conseguimos carregar seus dados. Tente novamente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>

        
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={60} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{usuario.nome}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{usuario.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name={usuario.role === 'admin' ? 'account-tie' : 'account'}
                  size={14}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                  {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configurações</Text>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Notificações</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receber lembretes diários
              </Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={notificacoes ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                {isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDarkMode ? colors.primary : colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Privacidade e Dados</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Gerenciar dados pessoais
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Sobre o App</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Versão 1.0.0
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações da Conta</Text>
          <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Criada em:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Última atualização:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(usuario.atualizadoEm).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.warning }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="logout" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.dangerButtonText}>Fazer Logout</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="delete" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.dangerButtonText}>Deletar Conta</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2025 Mood Tracker - Cuide do seu bem-estar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  description: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 13,
  },
  infoItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 20,
  },
  dangerButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
