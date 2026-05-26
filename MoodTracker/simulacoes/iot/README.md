# IoT Simulator - MoodTracker

Simulador de sensores ambientais para testar a integração IoT do MoodTracker.

## Visão Geral

O simulador envia dados realistas de sensores (temperatura, luminosidade, ruído) para a API a cada 30 segundos, gerando alertas automáticos quando valores excedem limites configurados.

### Funcionalidades
- ✅ Simulação de 3 tipos de sensores
- ✅ Geração automática de alertas
- ✅ Dois modos: ciclo de testes ou contínuo
- ✅ Logging informativo
- ✅ Validação de conectividade da API

---

## Instalação

### Pré-requisitos
- Node.js 16+
- Backend do MoodTracker rodando (porta 3000)

### Setup
```bash
cd backend
npm install
```

---

## Execução

### Modo Ciclo (recomendado para testes)
Executa 5 ciclos de teste com diferentes cenários:
```bash
npm run simulate
```

**Saída esperada:**
```
IoT Simulator iniciado
API: http://localhost:3000
Intervalo: 30 segundos

CICLO: Condições Normais
[14:30:15] Dados enviados com sucesso
Temperatura: 24.5°C, Luminosidade: 350 lux, Ruído: 55 dB
Nenhum alerta

CICLO: Ambiente Quente
[14:30:45] Dados enviados com sucesso
Temperatura: 32.1°C, Luminosidade: 280 lux, Ruído: 60 dB
Alertas gerados: 1
TEMPERATURA: Ambiente quente demais, pode causar desconforto.
```

**Duração:** ~2.5 minutos (5 ciclos × 3 requests × 30s)

### Modo Contínuo
Envia dados indefinidamente:
```bash
npm run simulate continuous
```

Para parar: `Ctrl + C`

---

## Ciclos de Teste

### 1. Condições Normais
- Temperatura: 18-24°C
- Luminosidade: 200-400 lux
- Ruído: 40-60 dB
- **Alertas:** Nenhum

### 2. Ambiente Quente
- Temperatura: 26-32°C (>28°C dispara alerta)
- Luminosidade: 200-300 lux
- Ruído: 50-65 dB
- **Alertas:** TEMPERATURA

### 3. Pouca Luz
- Temperatura: 18-24°C
- Luminosidade: 10-50 lux (<50 dispara alerta)
- Ruído: 40-60 dB
- **Alertas:** ILUMINAÇÃO

### 4. Muito Barulho
- Temperatura: 18-24°C
- Luminosidade: 200-400 lux
- Ruído: 70-85 dB (>70 dispara alerta)
- **Alertas:** RUÍDO

### 5. Condições Críticas
- Temperatura: 28-35°C
- Luminosidade: 10-40 lux
- Ruído: 75-90 dB
- **Alertas:** TEMPERATURA + ILUMINAÇÃO + RUÍDO

---

## Estrutura de Dados

### Payload de Envio
```json
{
  "temp": 24.5,
  "luz": 350,
  "ruido": 55,
  "horario": "2025-11-22T14:30:15.123Z"
}
```

### Resposta da API
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "temp": 24.5,
  "luz": 350,
  "ruido": 55,
  "dataHora": "2025-11-22T14:30:15.123Z",
  "alerts": [
    {
      "tipo": "TEMPERATURA",
      "mensagem": "Ambiente quente demais, pode causar desconforto."
    }
  ]
}
```

---

## Endpoints da API

### POST /environment
Envia dados de sensores
```bash
curl -X POST http://localhost:3000/environment \
  -H 'Content-Type: application/json' \
  -d '{"temp": 25, "luz": 300, "ruido": 60}'
```

### GET /environment/current
Obtém últimos dados (requer token)
```bash
curl -H 'Authorization: Bearer {token}' \
  http://localhost:3000/environment/current
```

### GET /alerts
Lista alertas (requer token)
```bash
curl -H 'Authorization: Bearer {token}' \
  http://localhost:3000/alerts
```

---

## Limites de Alerta

| Sensor | Limite | Condição | Alert Type |
|--------|--------|----------|-----------|
| Temperatura | 28°C | > 28 | TEMPERATURA |
| Luminosidade | 50 lux | < 50 | ILUMINAÇÃO |
| Ruído | 70 dB | > 70 | RUÍDO |

---

## Variáveis de Ambiente

```bash
# .env backend
API_URL=http://localhost:3000
PORT=3000
JWT_SECRET=seu-secret-key
```

---

## Logs

O simulador exibe logs estruturados:

```
✅ Sucesso: [HH:MM:SS] Dados enviados com sucesso
⚠️  Alerta: Alertas gerados: N
❌ Erro: [HH:MM:SS] Erro ao enviar dados
```

### Exemplo Completo
```
[14:30:15] Pacote #1 | 0.0min - Enviando dados de sensores
[14:30:15] Dados enviados com sucesso
Temperatura: 23.8°C, Luminosidade: 320 lux, Ruído: 52 dB
Nenhum alerta

[14:30:45] Pacote #2 | 0.5min - Enviando dados de sensores
[14:30:45] Dados enviados com sucesso
Temperatura: 29.2°C, Luminosidade: 280 lux, Ruído: 65 dB
Alertas gerados: 1
TEMPERATURA: Ambiente quente demais, pode causar desconforto.
```

---

## Troubleshooting

### API não está disponível
```
Erro: API não está disponível em http://localhost:3000
Certifique-se de que o backend está rodando: npm run dev
```

**Solução:** Inicie o backend em outro terminal:
```bash
cd backend
npm run dev
```

### Timeout na requisição
```
Erro ao enviar dados: ECONNREFUSED
```

**Solução:** Verifique se o backend está rodando na porta correta.

### Banco de dados vazio (nenhum alerta)
O simulador não persiste dados no BD da aplicação mobile. Os dados são apenas para a API backend.

Para visualizar dados, use:
```bash
curl -H 'Authorization: Bearer {admin-token}' \
  http://localhost:3000/environment/latest
```

---

## Integração com Frontend

O dashboard do app mobile consulta `/environment/current` e `/alerts` para exibir:
1. Dados ambientais atuais
2. Alertas gerados automaticamente

### Fluxo
```
Simulator (Node.js)
  ↓ POST /environment (cada 30s)
Backend API (Express)
  ↓ salva dados + gera alertas
Banco SQLite
  ↓ consulta
Frontend Mobile (React Native)
  ↓ exibe dados + alertas no Dashboard
```

---

## Arquivos

- `iot-simulator.ts` - Script principal do simulador
- `payloads-example.json` - Exemplos de payloads e responses
- `README.md` - Este arquivo

---

## Desenvolvimento

### Modificar Ciclos
Edit `backend/scripts/iot-simulator.ts`:
```typescript
const cycles = [
  { name: 'Seu Ciclo', adjustments: { temp: 5, luz: -100, ruido: 10 } },
  // ...
];
```

### Alterar Intervalo
```typescript
const INTERVAL_SECONDS = 60; // Mudar de 30 para 60 segundos
```

### Adicionar Mais Sensores
Estenda o objeto `SensorData`:
```typescript
interface SensorData {
  temp: number;
  luz: number;
  ruido: number;
  umidade?: number; // novo sensor
}
```

---

## Performance

- **Requisições por ciclo:** 15 (5 ciclos × 3 requests)
- **Tempo total:** ~2.5 minutos
- **Tamanho payload:** ~100 bytes
- **Taxa de sucesso esperada:** 100% (com backend rodando)

---

## Próximas Melhorias

- [ ] Suportar múltiplos sensores (umidade, CO₂)
- [ ] Persistir dados em arquivo local
- [ ] Integração com MQTT
- [ ] Dashboard próprio do simulador

---

