# MoodTracker - MVP de Rastreamento de Humor com Monitoramento Ambiental

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-MVP%20Completo-brightgreen)

---

## 📋 Visão Geral do Projeto

**MoodTracker** é um MVP que demonstra uma arquitetura distribuída completa para rastreamento de humor diário integrado com monitoramento ambiental (sensores IoT simulados). A aplicação valida a prova de conceito de um sistema interdisciplinar conectando **Banco de Dados**, **API REST**, **Testes Automatizados**, **Frontend Mobile**, **Segurança** e **Simulação IoT**.

### Tecnologias Principais

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React Native + Expo
- **Banco de Dados:** SQLite
- **Testes:** Jest + Supertest (43 testes automatizados)
- **Simulação IoT:** Node.js scripts com dados realistas

---

## 🗂️ Estrutura do Projeto

```
MoodTracker/
├── backend/                      # API REST + Testes + Simulador
│   ├── src/
│   │   ├── index.ts             # Servidor Express (porta 3001)
│   │   ├── database.ts          # Camada de persistência SQLite
│   │   ├── routes/              # Controllers (auth, mood, environment, alerts)
│   │   └── services/            # Lógica de autenticação (AuthService)
│   ├── __tests__/               # 43 testes automatizados
│   ├── scripts/
│   │   └── iot-simulator.ts     # Simulador de sensores (5 ciclos)
│   ├── jest.config.js           # Configuração Jest
│   ├── package.json             # Dependências backend
│   └── .env.example             # Variáveis de ambiente
│
├── frontend/                     # App Mobile (React Native + Expo)
│   ├── src/
│   │   ├── App.tsx              # Componente raiz + navegação
│   │   ├── screens/             # 6 telas da aplicação
│   │   │   ├── LoginScreen      # Autenticação
│   │   │   ├── HomeScreen       # Dashboard principal
│   │   │   ├── DashboardScreen  # Análise de humor
│   │   │   ├── HistoryScreen    # Histórico
│   │   │   ├── ProfileScreen    # Perfil do usuário
│   │   │   └── SettingsScreen   # Configurações
│   │   ├── context/             # AuthContext + ThemeContext
│   │   └── utils/               # API client, storage, validação
│   ├── app.json                 # Config Expo
│   ├── index.js                 # Entry point Expo
│   └── package.json             # Dependências frontend
│
├── simulacoes/                   # Testes e Simulação IoT
│   ├── iot/                      # Documentação do simulador
│   │   ├── README.md            # Guia completo IoT
│   │   └── payloads-example.json # Exemplos de payload
│   └── scripts/                  # Scripts de teste
│
├── db/                           # Modelo de Banco de Dados
│   ├── schema.sql               # DDL (4 tabelas, constraints, indexes)
│   ├── sample-queries.sql       # 22 queries de exemplo
│   └── er-diagram.drawio        # Diagrama ER (editável)
│
├── documentacao/                 # Entregáveis não-código
│   ├── api/
│   │   └── swagger.yaml         # API completa (OpenAPI 3.0)
│   ├── banco-dados/             # ER diagram, schema, queries
│   ├── testes/
│   │   ├── plan.md              # 35 casos de teste
│   │   ├── evidence/            # Evidências de testes
│   │   └── curl-examples.md     # Exemplos HTTP
│   └── entregas/                # Checklist + implementação final
│
├── tests/                        # Plano de testes geral
│   ├── plan.md                  # Organização dos casos
│   └── evidence/                # Prints/logs de execução
│
├── ARCHITECTURE.md              # Documentação da arquitetura
├── README.md                    # Este arquivo
├── package.json                 # Workspace root (scripts orquestrados)
└── yarn.lock                    # Lockfile (dependências fixas)
```

---

## 🚀 Quick Start (10 minutos)

### Pré-requisitos

- **Node.js** ≥ 18.0.0
- **Yarn** 1.22.0+
- **Git**
- **Expo Go** (app mobile, para visualizar no celular via QR code)

### 1. Instalação

```bash
# Clonar/extrair repositório
cd MoodTracker

# Instalar dependências (frontend + backend)
yarn install-all
```

### 2. Configurar Variáveis de Ambiente

```bash
# Backend
cd backend
cp .env.example .env
# Edite .env conforme necessário (DB_PATH, PORT, JWT_SECRET, etc.)
cd ..
```

### 3. Iniciar o Backend

```bash
# Terminal 1
yarn dev-backend
# API rodando em http://localhost:3001
```

### 4. Iniciar o Frontend (Mobile)

```bash
# Terminal 2
yarn dev-frontend
# Expo mostrará QR code
# Escanear com Expo Go (Android/iOS) ou pressionar 'w' para versão web
```

### 5. Executar Testes (Opcional)

```bash
# Terminal 3
yarn test
# 43 testes executados (11 unit + 32 integration)
```

### 6. Executar IoT Simulator (Opcional)

```bash
# Terminal 4
yarn simulate
# Simulador roda por 2.5 minutos com 5 ciclos de dados
```

---

## 📊 1️⃣ MODELO DE BANCO DE DADOS

### Objetivo Atendido
✅ Estruturar base de dados com consistência, integridade e relacionamentos.

### Entregáveis Presentes

#### a) Diagrama ER (4+ entidades)
- **Arquivo:** `db/er-diagram.drawio`
- **Entidades:** users, mood_entries, environment_data, alerts
- **Visualização:** Abrir em https://app.diagrams.net (arquivo XML editável)
- **Características:** Relacionamentos 1:N, constraints, índices

#### b) Script SQL (CREATE TABLE + chaves)
- **Arquivo:** `db/schema.sql` (60+ linhas)
- **Conteúdo:**
  - 4 tabelas com primary keys
  - Foreign keys com CASCADE
  - CHECK constraints (validação de domínio)
  - Índices para performance
  - 3 views (user_mood_summary, environment_alerts, daily_stats)

#### c) Consultas SQL (22 exemplos)
- **Arquivo:** `db/sample-queries.sql`
- **Exemplos:**
  - CRUD básico (SELECT, INSERT, UPDATE, DELETE)
  - Análises (agregações, GROUP BY)
  - Correlações (mood vs. ambiente)
  - Filtragens por período, usuário, alertas

---

## 🌐 2️⃣ IMPLEMENTAÇÃO DOS SERVIÇOS (API)

### Objetivo Atendido
✅ API RESTful funcional com arquitetura em camadas (Controllers, Services, Repository).

### Entregáveis Presentes

#### a) 13+ Endpoints (>5 exigidos)

| Método | Path | Função | Auth |
|--------|------|--------|------|
| POST | `/auth/register` | Criar conta | ❌ |
| POST | `/auth/login` | Login (retorna JWT) | ❌ |
| GET | `/auth/me` | Dados do usuário | ✅ |
| DELETE | `/auth/delete-account` | Deletar conta | ✅ |
| POST | `/mood` | Registrar humor | ✅ |
| GET | `/mood/user/:id` | Listar humores | ✅ |
| DELETE | `/mood/:id` | Remover humor | ✅ |
| POST | `/environment` | Enviar dados sensores | ❌ |
| GET | `/environment/current` | Dados ambiente atuais | ✅ |
| GET | `/environment/latest` | Últimos dados (admin) | ✅ |
| GET | `/alerts` | Listar alertas | ✅ |
| POST | `/alerts` | Criar alerta (admin) | ✅ |
| GET | `/health` | Status da API | ❌ |

**Documentação completa:** `documentacao/api/swagger.yaml` (OpenAPI 3.0)

#### b) Arquitetura em Camadas

```
Routes (Controllers)
   ↓
Services (Lógica)
   ↓
Database (Persistência)
```

**Estrutura:**
- `backend/src/routes/` → Controllers (auth.ts, mood.ts, environment.ts, alerts.ts)
- `backend/src/services/authService.ts` → Lógica (bcrypt, JWT, ID generation)
- `backend/src/database.ts` → Repository (queries promise-based)

#### c) Documentação API (Swagger)

- **Arquivo:** `documentacao/api/swagger.yaml`
- **Importar em:** https://editor.swagger.io
- **Conteúdo:** Todos os 13+ endpoints com exemplos de request/response, schemas, security schemes


---

## 🧪 3️⃣ PLANO DE TESTES DA APLICAÇÃO

### Objetivo Atendido
✅ Testes automatizados + plano detalhado com 35 casos de teste.

### Entregáveis Presentes

#### a) Plano com 35 Casos (>5 exigidos)

- **Arquivo:** `tests/plan.md`
- **Organização:** 35 casos (CT-001 a CT-035) agrupados por funcionalidade
- **Cada caso contém:** Cenário, entrada, saída esperada, status

#### b) 43 Testes Automatizados Implementados

| Suite | Testes | Arquivo | Cobertura |
|-------|--------|---------|-----------|
| AuthService | 11 unit tests | `authService.test.ts` | Bcrypt, JWT, UUID |
| Auth Routes | 10 integration | `auth.integration.test.ts` | Register, login, me, delete |
| Mood Routes | 10 integration | `mood.integration.test.ts` | CRUD + ownership |
| Environment Routes | 12 integration | `environment.integration.test.ts` | Sensores, alertas, admin |
| **Total** | **43** | **4 arquivos** | **Full stack** |

#### c) Evidências de Execução

- **Arquivo:** `tests/evidence/test-results.md`
- **Conteúdo:** Estrutura esperada dos testes e resultados
- **Arquivo:** `tests/evidence/curl-examples.md`
- **Conteúdo:** 14 exemplos de HTTP requests com responses


### Executar Testes

```bash
cd backend

# Todos os testes
yarn test

# Com cobertura
yarn test -- --coverage

# Watch mode (re-executa ao editar)
yarn test -- --watch
```

---

## 📱 4️⃣ IMPLEMENTAÇÃO DO FRONT-END MOBILE

### Objetivo Atendido
✅ 6 telas funcionais (>3 exigidos) com integração API e layout responsivo.

### Entregáveis Presentes

#### a) 6 Telas Implementadas

| Tela | Descrição | Função |
|------|-----------|--------|
| **LoginScreen** | Autenticação | Registrar/Login via JWT |
| **HomeScreen** | Dashboard | Resumo de humor + ações |
| **DashboardScreen** | Análise | Gráficos/tendências |
| **HistoryScreen** | Histórico | Lista de registros |
| **ProfileScreen** | Perfil | Dados do usuário |
| **SettingsScreen** | Config | Tema, preferências |

#### b) Integração com API

- **Arquivo:** `frontend/src/utils/api.ts`
- **Funcionalidade:** HTTP client com interceptor JWT
- **Base URL:** `http://localhost:3001` (configurável)
- **Autenticação:** Token salvo em AsyncStorage

#### c) Layout Responsivo

- **Stack Navigation:** Bottom tabs para navegação fácil
- **Componentes:** React Native nativos + ícones Tabler
- **Temas:** Light/Dark (via ThemeContext)
- **Contextos:** AuthContext (login state) + ThemeContext (UI)

### Como Visualizar no Mobile

#### Opção 1: Expo Go (Recomendado)
```bash
# Terminal 1
yarn dev-backend

# Terminal 2
yarn dev-frontend
# Scanear QR code com Expo Go (Android/iOS)
```

#### Opção 2: Web (teste rápido)
```bash
yarn dev-frontend
# Pressionar 'w' para versão web (menos precisa para mobile)
```

#### Opção 3: Android Emulator
```bash
yarn dev-frontend
# Pressionar 'a' para Android emulator
```

---

## 🛡️ 5️⃣ SEGURANÇA DA APLICAÇÃO

### Objetivo Atendido
✅ Autenticação + Controle de acesso + 4+ práticas de segurança.

### Entregáveis Presentes

#### a) Sistema de Login com Criptografia

- **Algoritmo:** Bcrypt (salt 10)
- **Arquivo:** `backend/src/services/authService.ts`
- **Implementação:** hashPassword(), comparePassword()
- **Teste:** `authService.test.ts` (11 unit tests)

#### b) Controle de Acesso (RBAC)

- **Roles:** `user` (padrão), `admin` (especial)
- **Middleware:** `authMiddleware` (valida JWT + role)
- **Endpoints protegidos:** 8 endpoints requerem role específica
- **Exemplo:** `GET /environment/latest` (apenas admin)

#### c) 4+ Práticas de Segurança Implementadas

1. **Autenticação JWT**
   - Token com 7 dias expiração
   - Header: `Authorization: Bearer <token>`
   - Validação em todas as rotas protegidas

2. **Criptografia de Senhas**
   - Bcrypt salt 10
   - Nunca armazenar plain text

3. **Validação de Input**
   - express-validator em todos endpoints
   - Sanitização contra XSS
   - Email, password, UUID validados

4. **Prepared Statements / Queries Parametrizadas**
   - SQLite promises (não há concatenação SQL)
   - Proteção contra SQL injection

5. **Ownership Checks**
   - Usuários acessam apenas seus dados
   - `GET /mood/user/:id` valida se é owner ou admin

6. **CORS + Headers de Segurança**
   - Whitelist de origens
   - Content-Type validation


---

## 🌡️ 6️⃣ SIMULAÇÃO DE DISPOSITIVOS IOT

### Objetivo Atendido
✅ Simulador de sensores com 5 ciclos de teste + integração com BD.

### Entregáveis Presentes

#### a) Simulador Funcional

- **Arquivo:** `backend/scripts/iot-simulator.ts`
- **Modo:** Ciclos (2.5 min) ou contínuo
- **Sensores:** Temperatura, Luz, Ruído (valores realistas)

#### b) 5 Ciclos de Simulação

| Ciclo | Duração | Sensores | Lógica |
|-------|---------|----------|--------|
| 1 | 30s | Normal: 22°C, 300 lux, 50 dB | Condições ideais |
| 2 | 30s | Quente: 32°C (+alerta), 300 lux, 50 dB | Temp exceeds 28°C |
| 3 | 30s | Pouca Luz: 22°C, 40 lux (+alerta), 50 dB | Luz abaixo 50 lux |
| 4 | 30s | Barulho: 22°C, 300 lux, 75 dB (+alerta) | Ruído acima 70 dB |
| 5 | 30s | Crítico: 32°C, 40 lux, 75 dB (3 alertas) | Múltiplos gatilhos |

#### c) Dados Enviados para Aplicação

- **Endpoint:** `POST /environment`
- **Payload:** JSON com `{ temperature, light, noise, timestamp }`
- **Resultado:** Dados salvos em BD + alertas gerados automaticamente
- **Exemplos:** `simulacoes/iot/payloads-example.json`

#### d) Documentação da Lógica IoT

- **Arquivo:** `simulacoes/iot/README.md`
- **Conteúdo:**
  - O que cada sensor mede
  - Limiares de alerta
  - Como a simulação influencia o sistema
  - Modo debug e troubleshooting

---

## 🧬 Arquitetura Geral

```
┌─────────────────────────────────────┐
│     Frontend Mobile (React Native)   │
│   (6 telas + contextos + API client) │
└──────────────┬──────────────────────┘
               │ HTTP/REST (JWT)
┌──────────────▼──────────────────────┐
│     Backend API (Express.js)        │
│  ┌──────────────────────────────┐   │
│  │ Routes (Controllers)         │   │
│  │ - auth, mood, environment    │   │
│  └──────────────┬───────────────┘   │
│  ┌──────────────▼───────────────┐   │
│  │ Services (Business Logic)    │   │
│  │ - AuthService, validation    │   │
│  └──────────────┬───────────────┘   │
│  ┌──────────────▼───────────────┐   │
│  │ Database Layer (SQLite)      │   │
│  │ - 4 tables, 3 views, queries │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   IoT Simulator (Node.js scripts)   │
│   (5 ciclos, sensores, alertas)     │
└──────────────────────────────────────┘
```

---

## 📦 Scripts Disponíveis

### Root (Workspace Orchestration)

```bash
yarn install-all       # Instalar tudo (frontend + backend)
yarn dev-backend       # Backend: Express + hot-reload
yarn dev-frontend      # Frontend: Expo start
yarn dev               # Atalho para backend (principal)
yarn dev-windows       # Abrir backend + frontend em janelas separadas
yarn test              # Rodar testes backend
yarn test-coverage     # Cobertura de testes
yarn simulate          # IoT simulator
```

### Backend (cd backend)

```bash
yarn dev               # Desenvolvimento (ts-node + hot-reload)
yarn start             # Produção (node dist)
yarn build             # Compilar TypeScript
yarn test              # Jest (43 testes)
yarn test:watch       # Watch mode
yarn simulate          # IoT simulator
```

### Frontend (cd frontend)

```bash
yarn start             # Expo start
yarn android           # Expo Android emulator
yarn ios               # Expo iOS simulator
yarn web               # Expo web
yarn test              # Jest React Native
```

---

## 🔧 Troubleshooting

### Backend não inicia
```bash
cd backend
rm -rf node_modules dist
yarn
yarn dev
```

### Frontend não conecta ao backend
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Se não funcionar, editar frontend/src/utils/api.ts
# Mudar BASE_URL conforme IP local
```

### Testes falhando
```bash
cd backend
rm test.db  # Remover BD de teste
yarn test
```

### Expo QR code não funciona
- Garantir que backend está rodando (`yarn dev-backend`)
- Usar mesma rede WiFi no celular + PC
- Tentar porta alternativa: `expo start --tunnel`

---

## 📄 Documentação Complementar

| Arquivo | Descrição |
|---------|-----------|
| `ARCHITECTURE.md` | Arquitetura detalhada do sistema |
| `documentacao/api/swagger.yaml` | API OpenAPI 3.0 completa |
| `db/schema.sql` | DDL do banco de dados |
| `db/sample-queries.sql` | 22 queries de exemplo |
| `db/er-diagram.drawio` | Diagrama ER (editar em draw.io) |
| `tests/plan.md` | Plano com 35 casos de teste |
| `simulacoes/iot/README.md` | Guia completo IoT |
| `simulacoes/iot/payloads-example.json` | Exemplos de payload |

---

## ✅ Checklist de Entrega

Todos os 6 requisitos implementados:

- ✅ **Banco de Dados:** 4 tabelas, ER diagram, 22 queries SQL
- ✅ **API REST:** 13+ endpoints, camadas (Controller→Service→DB), Swagger
- ✅ **Testes:** 35 casos de teste, 43 testes automatizados, evidências
- ✅ **Frontend Mobile:** 6 telas, integração API, responsivo
- ✅ **Segurança:** Bcrypt + JWT + RBAC + validação + SQLi protection
- ✅ **IoT:** Simulador com 5 ciclos, alertas automáticos, documentação

---

## 📋 Integrantes do Projeto

- **Eduardo Oliveira Guimarães - RM98778**
- **Vinicius Britto Amaral - RM99655**
- **Pedro Henrique Angelo Crispim de Almeida Teixeira - RM99005**
- **Lucas Magalhães de Lima - RM-99638**
- **Eddy Takashi Hernandez Nakauchi - RM-99031**

---

## 📞 Suporte Rápido

- **API não responde?** → Verificar `yarn dev-backend` e `http://localhost:3001/health`
- **App não conecta?** → Mudar base URL em `frontend/src/utils/api.ts`
- **Testes falhando?** → `cd backend && rm test.db && yarn test`
- **Dúvidas arquitetura?** → Ver `ARCHITECTURE.md`

---

## 📝 Licença

MIT License — Veja detalhes em projeto

---

**Desenvolvido:** Novembro 2025  
**Stack:** React Native + Node.js + SQLite  
**Status:** ✅ MVP Completo e Pronto para Avaliação

