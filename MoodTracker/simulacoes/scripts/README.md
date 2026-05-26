# 🤖 IoT Simulator - Documentação Técnica

## Visão Geral

O **IoT Simulator** é um script que simula sensores ambientais inteligentes, enviando dados para a API do Mood Tracker a intervalos regulares. Ele gera alertas automáticos baseados em condições do ambiente.

## 📊 Dados Simulados

O simulator envia pacotes JSON com a seguinte estrutura:

```json
{
  "temp": 29.5,
  "luz": 120,
  "ruido": 40,
  "horario": "2025-11-21T19:20:00"
}
```

### Campos

| Campo | Tipo | Intervalo | Descrição |
|-------|------|-----------|-----------|
| `temp` | number | 15-35°C | Temperatura ambiente |
| `luz` | number | 10-600 lux | Luminosidade (iluminação) |
| `ruido` | number | 30-100 dB | Nível de ruído |
| `horario` | string | ISO 8601 | Data e hora UTC |

## ⚠️ Regras de Alerta

Os alertas são gerados **automaticamente pela API** baseado nos seguintes thresholds:

| Condição | Limite | Alerta |
|----------|--------|--------|
| Temperatura alta | **temp > 28°C** | "Ambiente quente demais, pode causar desconforto." |
| Iluminação baixa | **luz < 50 lux** | "Iluminação fraca, risco de fadiga ocular." |
| Ruído alto | **ruido > 70 dB** | "Ambiente barulhento, foco prejudicado." |

## 🚀 Como Usar

### Instalação

```bash
# No diretório backend
cd backend

# Instalar dependências (inclui axios)
npm install
```

### Modo 1: Ciclos de Simulação (Recomendado para Demo)

Simula diferentes cenários de ambiente (normal, quente, pouca luz, muito barulho, crítico):

```bash
npm run simulate
```

**Saída esperada:**
```
============================================================
🚀 IoT SIMULATOR INICIADO
📍 API: http://localhost:3000
⏱️  Intervalo: 30 segundos
============================================================

============================================================
🔄 CICLO: Condições Normais
============================================================

[19:30:45] 📡 Dados enviados com sucesso!
  🌡️  Temperatura: 23.5°C
  💡 Luminosidade: 250 lux
  🔊 Ruído: 45 dB
  ✅ Nenhum alerta (condições normais)

[19:31:15] 📡 Dados enviados com sucesso!
  🌡️  Temperatura: 29.5°C
  💡 Luminosidade: 120 lux
  🔊 Ruído: 40 dB
  ⚠️  Alertas gerados: 1
     - TEMPERATURA: Ambiente quente demais, pode causar desconforto.
```

### Modo 2: Simulação Contínua (Monitoramento)

Envia dados indefinidamente em intervalos regulares:

```bash
npm run simulate -- continuous
```

A cada 30 segundos envia novos dados com variações aleatórias realistas.

### Parar a Simulação

Pressione `Ctrl + C` no terminal.

## 📋 Pré-requisitos

- Backend do Mood Tracker rodando em `http://localhost:3000`
- Dependência `axios` instalada

### Checklist de Setup

```bash
# Terminal 1: Iniciar Backend
cd backend
npm install
npm run dev

# Aguardar: "Servidor rodando na porta 3000"

# Terminal 2: Executar Simulator
cd backend
npm run simulate
```

## 📈 Casos de Teste Automáticos

O simulator testa automaticamente os seguintes cenários:

### 1. Condições Normais
- Temp: ~24°C
- Luz: ~250 lux
- Ruído: ~45 dB
- **Resultado**: ✅ Sem alertas

### 2. Ambiente Quente
- Temp: ~29°C
- Luz: ~250 lux
- Ruído: ~45 dB
- **Resultado**: ⚠️ 1 alerta (temperatura)

### 3. Pouca Luz
- Temp: ~24°C
- Luz: ~40 lux (muito baixo)
- Ruído: ~45 dB
- **Resultado**: ⚠️ 1 alerta (luminosidade)

### 4. Muito Barulho
- Temp: ~24°C
- Luz: ~250 lux
- Ruído: ~75 dB
- **Resultado**: ⚠️ 1 alerta (ruído)

### 5. Condições Críticas
- Temp: ~32°C
- Luz: ~40 lux
- Ruído: ~75 dB
- **Resultado**: ⚠️ 3 alertas (todos os thresholds)

## 🔧 Configuração Avançada

### Alterar Intervalo

Edite `backend/scripts/iot-simulator.ts`, linha 8:

```typescript
const INTERVAL_SECONDS = 30; // Mude para 15, 60, etc.
```

Recompile:
```bash
npm run build
npm run simulate
```

### Usar Variáveis de Ambiente

```bash
# Linux/Mac
export API_URL=http://seu-servidor:3000
npm run simulate

# Windows (PowerShell)
$env:API_URL = "http://seu-servidor:3000"
npm run simulate
```

## 📡 Fluxo de Dados

```
IoT Simulator
    ↓
POST /environment
    ↓
Backend API
    ↓
[Valida dados]
    ↓
[Salva em EnvironmentData]
    ↓
[Verifica thresholds]
    ↓
[Gera alertas se necessário]
    ↓
Dashboard recebe dados
    ↓
Usuário vê recomendações
```

## 🐛 Troubleshooting

### Erro: "API não está disponível"
```
❌ Erro: API não está disponível em http://localhost:3000
```

**Solução**: Inicie o backend em outro terminal
```bash
cd backend && npm run dev
```

### Erro: "Cannot find module 'axios'"
```
Cannot find module 'axios'
```

**Solução**: Instale as dependências
```bash
npm install
```

### Dados não aparecem no Dashboard

1. Verifique se o backend está recebendo os dados:
```bash
# Em outro terminal (com jq instalado)
curl http://localhost:3000/environment/latest | jq
```

2. Verifique os logs do backend para erros

## 💡 Dicas para Demonstração

1. **Iniciar em ciclos** - Mais impressionante para apresentação (mostra todos os cenários)
2. **Abrir Dashboard simultaneamente** - Mostrar alertas em tempo real
3. **Monitorar logs** - Demonstra claramente quando alertas são gerados
4. **Mencionar na apresentação** - "IoT simulado de forma realista"

## 📊 Métricas de Sucesso

Durante a apresentação você pode mostrar:

- ✅ Quantos pacotes foram enviados
- ✅ Quantos alertas foram gerados
- ✅ Tempo total de simulação
- ✅ Integração perfeita com a API

Exemplo esperado para demonstração de 5 minutos:
- 10-15 pacotes de sensores enviados
- 10-15 alertas gerados
- 0 erros de comunicação
- Dashboard atualizado em tempo real

---

**Desenvolvido para FIAP - Projeto Mood Tracker** 🚀
