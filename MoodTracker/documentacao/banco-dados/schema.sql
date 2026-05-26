-- MoodTracker - Database Schema
-- SQLite 3 compatible
-- Created: 2025-11-22

-- Tabela: users
-- Descrição: Armazena dados de usuários do sistema
-- Roles: 'user' (padrão), 'admin' (acesso administrativo)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senhaHash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  criadoEm TEXT NOT NULL,
  atualizadoEm TEXT NOT NULL
);

-- Tabela: mood_entries
-- Descrição: Registros diários de humor do usuário
-- Humor: 'feliz', 'neutro', 'ansioso', 'cansado'
-- FK: userId referencia users(id) com cascata de exclusão
CREATE TABLE IF NOT EXISTS mood_entries (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  humor TEXT NOT NULL CHECK(humor IN ('feliz', 'neutro', 'ansioso', 'cansado')),
  comentario TEXT,
  dataHora TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para otimizar buscas por userId e dataHora
CREATE INDEX IF NOT EXISTS idx_mood_entries_userId_dataHora 
  ON mood_entries(userId, dataHora DESC);

-- Tabela: environment_data
-- Descrição: Dados de sensores ambientais
-- Campos: temperatura (°C), luminosidade (lux), ruído (dB)
CREATE TABLE IF NOT EXISTS environment_data (
  id TEXT PRIMARY KEY,
  temperatura REAL NOT NULL,
  luminosidade REAL NOT NULL,
  ruido REAL NOT NULL,
  dataHora TEXT NOT NULL
);

-- Índice para otimizar buscas por dataHora
CREATE INDEX IF NOT EXISTS idx_environment_data_dataHora 
  ON environment_data(dataHora DESC);

-- Tabela: alerts
-- Descrição: Alertas do sistema gerados automaticamente
-- Tipo: 'TEMPERATURA', 'ILUMINAÇÃO', 'RUÍDO', etc.
-- Lido: 0 (não lido), 1 (lido)
-- userId: NULL se alerta é geral, referencia users(id) se pessoal
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  dataHora TEXT NOT NULL,
  userId TEXT,
  lido INTEGER DEFAULT 0,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para otimizar buscas por userId e dataHora
CREATE INDEX IF NOT EXISTS idx_alerts_userId_dataHora 
  ON alerts(userId, dataHora DESC);

-- Índice para otimizar buscas por tipo
CREATE INDEX IF NOT EXISTS idx_alerts_tipo 
  ON alerts(tipo);

-- Views (opcional, mas útil para análises)

-- View: mood_daily_summary
-- Resumo diário de humores registrados
CREATE VIEW IF NOT EXISTS mood_daily_summary AS
SELECT 
  DATE(dataHora) as data,
  userId,
  humor,
  COUNT(*) as quantidade
FROM mood_entries
GROUP BY DATE(dataHora), userId, humor;

-- View: weekly_mood_average
-- Média semanal de humor (1=cansado/ansioso, 2=neutro, 4=feliz)
CREATE VIEW IF NOT EXISTS weekly_mood_average AS
SELECT 
  userId,
  ROUND(AVG(CASE 
    WHEN humor = 'feliz' THEN 4
    WHEN humor = 'neutro' THEN 2
    WHEN humor = 'ansioso' THEN 1
    WHEN humor = 'cansado' THEN 1
  END), 2) as media_humor,
  COUNT(*) as registros_semana
FROM mood_entries
WHERE dataHora > datetime('now', '-7 days')
GROUP BY userId;

-- View: environment_alerts_today
-- Alertas ambientais gerados hoje
CREATE VIEW IF NOT EXISTS environment_alerts_today AS
SELECT 
  tipo,
  COUNT(*) as quantidade,
  MAX(dataHora) as ultimo_alerta
FROM alerts
WHERE DATE(dataHora) = DATE('now')
  AND tipo IN ('TEMPERATURA', 'ILUMINAÇÃO', 'RUÍDO')
GROUP BY tipo;

