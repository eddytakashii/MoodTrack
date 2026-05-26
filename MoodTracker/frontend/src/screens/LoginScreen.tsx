import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginSchema, registerSchema, formatZodError } from '../utils/validation';

export default function LoginScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasBackendError, setHasBackendError] = useState(false);

  const { login, register } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setHasBackendError(false);
  };

  const validateAndSubmit = async () => {
    // Marcar todos os campos como tocados
    const allTouched: Record<string, boolean> = {};
    if (!isLogin) allTouched.nome = true;
    allTouched.email = true;
    allTouched.senha = true;
    setTouched(allTouched);

    try {
      const emailNormalizado = email.trim().toLowerCase();

      // Validar com Zod
      const schema = isLogin ? loginSchema : registerSchema;
      const data = isLogin 
        ? { email: emailNormalizado, senha }
        : { nome: nome.trim(), email: emailNormalizado, senha };
      
      schema.parse(data);
      
      // Se passou na validação, limpar erros e tentar autenticar
      setErrors({});
      setHasBackendError(false);
      setLoading(true);

      try {
        if (isLogin) {
          await login(emailNormalizado, senha);
        } else {
          await register(nome.trim(), emailNormalizado, senha);
        }
        // RootNavigator vai detectar isAuthenticated e mudar automaticamente
      } catch (error: any) {
        // Erro do backend (ex: credenciais inválidas)
        setHasBackendError(true);
        const mensagem = error.message || (isLogin ? 'Falha ao fazer login' : 'Falha ao registrar');
        Alert.alert('Atenção', mensagem, [{ text: 'OK' }]);
      } finally {
        setLoading(false);
      }
      } catch (error: any) {
      // Erro de validação do Zod
      if (error.errors) {
        const formattedErrors = formatZodError(error);
        setErrors(formattedErrors);
      }
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setNome('');
    setEmail('');
    setSenha('');
    setErrors({});
    setTouched({});
    setHasBackendError(false);
  };

  const getInputStyle = (field: string) => {
    const hasError = errors[field] && touched[field];
    return [
      styles.input,
      {
        backgroundColor: colors.surface,
        color: colors.text,
        borderColor: hasError ? colors.error : colors.border,
        borderWidth: hasError ? 2 : 1,
      },
    ];
  };

  // Propriedades para evitar modal do iOS quando há erro
  const getPasswordProps = () => {
    if (hasBackendError) {
      return {
        textContentType: 'none' as const,
        autoComplete: 'off' as const,
        passwordRules: 'required: lower; required: upper; required: digit; max-consecutive: 2;',
      };
    }
    return {
      textContentType: 'password' as const,
      autoComplete: 'password' as const,
    };
  };

  const getEmailProps = () => {
    if (hasBackendError) {
      return {
        textContentType: 'none' as const,
        autoComplete: 'off' as const,
      };
    }
    return {
      textContentType: 'emailAddress' as const,
      autoComplete: 'email' as const,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="emoticon-happy" size={60} color={colors.primary} style={styles.logo} />
          <Text style={[styles.title, { color: colors.text }]}>Mood Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Acompanhe seu bem-estar todos os dias
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <View>
              <TextInput
                style={getInputStyle('nome')}
                placeholder="Nome"
                placeholderTextColor={colors.textSecondary}
                value={nome}
                onChangeText={(text) => {
                  setNome(text);
                  clearFieldError('nome');
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, nome: true }))}
                editable={!loading}
                textContentType="name"
                autoComplete="name"
                autoCapitalize="words"
              />
            {errors.nome && touched.nome && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.nome}</Text>
            )}
            </View>
          )}

          <View>
            <TextInput
              style={getInputStyle('email')}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError('email');
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
              {...getEmailProps()}
            />
            {errors.email && touched.email && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={getInputStyle('senha')}
              placeholder="Senha"
              placeholderTextColor={colors.textSecondary}
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                clearFieldError('senha');
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, senha: true }))}
              secureTextEntry
              editable={!loading}
              {...getPasswordProps()}
            />
            {errors.senha && touched.senha && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.senha}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
            onPress={validateAndSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Entrar' : 'Registrar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleMode}
            disabled={loading}
          >
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isLogin
                ? 'Não tem conta? Registre-se'
                : 'Já tem conta? Faça login'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>Funcionalidades:</Text>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="note-outline" size={18} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureItem, { color: colors.text }]}>Registre seu humor diariamente</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="chart-bar" size={18} style={styles.featureIcon} />
            <Text style={styles.featureItem}>Acompanhe suas tendências</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="thermometer" size={18} style={styles.featureIcon} />
            <Text style={styles.featureItem}>Monitoramento ambiental</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} style={styles.featureIcon} />
            <Text style={styles.featureItem}>Recomendações personalizadas</Text>
          </View>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  features: {
    padding: 15,
    borderRadius: 10,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
    color: '#666',
  },
});
