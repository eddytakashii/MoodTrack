-- MoodTracker - Sample Queries
-- Exemplos de consultas úteis para análise e monitoramento

-- ====== QUERIES DE USUÁRIOS ======

-- 1. Listar todos os usuários registrados
SELECT id, nome, email, role, criadoEm FROM users ORDER BY criadoEm DESC;

-- 2. Contar usuários por role
SELECT role, COUNT(*) as total FROM users GROUP BY role;

-- 3. Buscar usuário por email (com normalização)
SELECT * FROM users WHERE email = 'user@example.com';

-- 4. Usuários cadastrados nos últimos 7 dias
SELECT id, nome, email, criadoEm 
FROM users 
WHERE criadoEm > datetime('now', '-7 days')
ORDER BY criadoEm DESC;


-- ====== QUERIES DE REGISTROS DE HUMOR ======

-- 5. Últimos 10 registros de humor de um usuário
SELECT id, humor, comentario, dataHora 
FROM mood_entries 
WHERE userId = 'user-id-aqui'
ORDER BY dataHora DESC 
LIMIT 10;

-- 6. Distribuição de humores da última semana (todos os usuários)
SELECT 
  humor,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM mood_entries WHERE dataHora > datetime('now', '-7 days')), 2) as percentual
FROM mood_entries
WHERE dataHora > datetime('now', '-7 days')
GROUP BY humor
ORDER BY quantidade DESC;

-- 7. Humores de um usuário por dia (últimos 7 dias)
SELECT 
  DATE(dataHora) as data,
  humor,
  COUNT(*) as registros
FROM mood_entries
WHERE userId = 'user-id-aqui'
  AND dataHora > datetime('now', '-7 days')
GROUP BY DATE(dataHora), humor
ORDER BY data DESC, humor;

-- 8. Média de humor semanal (para cada usuário)
SELECT 
  userId,
  ROUND(AVG(CASE 
    WHEN humor = 'feliz' THEN 4
    WHEN humor = 'neutro' THEN 2
    WHEN humor = 'ansioso' THEN 1
    WHEN humor = 'cansado' THEN 1
  END), 2) as media_humor
FROM mood_entries
WHERE dataHora > datetime('now', '-7 days')
GROUP BY userId
ORDER BY media_humor DESC;

-- 9. Registros com comentários de um usuário
SELECT id, humor, comentario, dataHora 
FROM mood_entries 
WHERE userId = 'user-id-aqui' 
  AND comentario IS NOT NULL
ORDER BY dataHora DESC;

-- 10. Usuário com maior variação de humor na semana
SELECT 
  userId,
  COUNT(DISTINCT humor) as humores_diferentes,
  MIN(CASE WHEN humor = 'feliz' THEN 1 ELSE 0 END) as teve_feliz,
  COUNT(*) as total_registros
FROM mood_entries
WHERE dataHora > datetime('now', '-7 days')
GROUP BY userId
HAVING COUNT(DISTINCT humor) > 1
ORDER BY humores_diferentes DESC;


-- ====== QUERIES DE DADOS AMBIENTAIS ======

-- 11. Últimos dados de sensores (últimas 24 horas)
SELECT 
  id,
  temperatura,
  luminosidade,
  ruido,
  dataHora
FROM environment_data
WHERE dataHora > datetime('now', '-1 day')
ORDER BY dataHora DESC
LIMIT 50;

-- 12. Estatísticas de temperatura (últimas 24 horas)
SELECT 
  ROUND(MIN(temperatura), 2) as temp_minima,
  ROUND(AVG(temperatura), 2) as temp_media,
  ROUND(MAX(temperatura), 2) as temp_maxima
FROM environment_data
WHERE dataHora > datetime('now', '-1 day');

-- 13. Períodos com iluminação fraca (< 50 lux)
SELECT 
  COUNT(*) as registros_baixa_luz,
  MIN(dataHora) as primeiro,
  MAX(dataHora) as ultimo
FROM environment_data
WHERE luminosidade < 50
  AND dataHora > datetime('now', '-7 days');

-- 14. Períodos com ruído acima do normal (> 70 dB)
SELECT 
  COUNT(*) as registros_muito_barulho,
  ROUND(AVG(ruido), 2) as ruido_medio
FROM environment_data
WHERE ruido > 70
  AND dataHora > datetime('now', '-7 days');


-- ====== QUERIES DE ALERTAS ======

-- 15. Últimos 20 alertas (não lidos primeiro)
SELECT id, tipo, mensagem, dataHora, lido 
FROM alerts
ORDER BY lido ASC, dataHora DESC
LIMIT 20;

-- 16. Alertas não lidos de um usuário
SELECT id, tipo, mensagem, dataHora 
FROM alerts
WHERE userId = 'user-id-aqui'
  AND lido = 0
ORDER BY dataHora DESC;

-- 17. Contagem de alertas por tipo (últimos 7 dias)
SELECT 
  tipo,
  COUNT(*) as quantidade,
  MAX(dataHora) as ultimo_alerta
FROM alerts
WHERE dataHora > datetime('now', '-7 days')
GROUP BY tipo
ORDER BY quantidade DESC;

-- 18. Alertas de temperatura disparados
SELECT 
  COUNT(*) as total_alertas_temperatura,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM alerts WHERE dataHora > datetime('now', '-7 days')), 2) as percentual
FROM alerts
WHERE tipo = 'TEMPERATURA'
  AND dataHora > datetime('now', '-7 days');

-- 19. Alertas gerais (sem userId específico)
SELECT id, tipo, mensagem, dataHora
FROM alerts
WHERE userId IS NULL
  AND dataHora > datetime('now', '-7 days')
ORDER BY dataHora DESC;


-- ====== QUERIES DE CORRELAÇÃO (ANÁLISES) ======

-- 20. Correlação: humor vs temperatura
-- Registros onde houve alteração de humor e dados ambientais próximos
SELECT 
  m.dataHora as momento_humor,
  m.humor,
  e.temperatura,
  e.luminosidade,
  e.ruido,
  CAST((julianday(e.dataHora) - julianday(m.dataHora)) * 24 as INTEGER) as horas_diferenca
FROM mood_entries m
JOIN environment_data e ON ABS(julianday(e.dataHora) - julianday(m.dataHora)) < 0.5 / 24
WHERE m.userId = 'user-id-aqui'
ORDER BY m.dataHora DESC
LIMIT 10;

-- 21. Período sem registros de humor
SELECT 
  DATE(criadoEm) as usuario_criado,
  COUNT(*) as total_usuarios_sem_registro,
  GROUP_CONCAT(nome, ', ') as nomes
FROM users u
LEFT JOIN mood_entries m ON u.id = m.userId
WHERE m.id IS NULL
  AND u.role = 'user'
GROUP BY 1;

-- 22. Usuários mais ativos (mais registros de humor)
SELECT 
  u.id,
  u.nome,
  COUNT(m.id) as total_registros,
  ROUND(COUNT(m.id) * 100.0 / (SELECT COUNT(*) FROM mood_entries), 2) as percentual
FROM users u
LEFT JOIN mood_entries m ON u.id = m.userId
WHERE u.role = 'user'
GROUP BY u.id
ORDER BY total_registros DESC
LIMIT 10;

