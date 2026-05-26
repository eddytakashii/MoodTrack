# 📐 ARQUITETURA VISUAL

## Fluxo de Navegação do App

```
┌─────────────────────────────────────────────────────┐
# Arquitetura

Visão resumida da arquitetura e dos fluxos principais do projeto.

Fluxo de navegação:
- Ao iniciar, o app verifica token em storage.
- Se autenticado: navega para a tela principal com abas.
- Se não: apresenta telas de login/registro.

Componentes e responsabilidades:
- `App.tsx`: navegação principal
- `AuthContext`: gerencia autenticação e estado do usuário
- `ApiService`: camada responsável por requisições HTTP
- `src/screens/*`: implementações das telas do app (Home, Dashboard, History, Profile, Settings)
- `backend/src`: API REST (endpoints e lógica de negócio)

Banco de dados (SQLite):
- `users` (id, nome, email, senhaHash, role, criadoEm, atualizadoEm)
- `mood_entries` (id, userId, humor, comentario, dataHora)
- `environment_data` (id, temperatura, luminosidade, ruido, dataHora)
- `alerts` (id, tipo, mensagem, dataHora, userId, lido)

Autenticação:
- JWT no header `Authorization: Bearer {token}`
- Fluxo: login/register → recebe token → salva em AsyncStorage → AuthContext atualiza estado

Requisição autenticada:
- ApiService obtém token de storage, adiciona header e envia requisição ao backend
- Backend valida token, verifica autorização e processa requisição

Pipeline de desenvolvimento (resumo):
- Instalar dependências no frontend e backend
- Iniciar backend (porta 3000) e testar endpoints
- Iniciar Expo para o app frontend

Stacks:
- Frontend: React Native, Expo, TypeScript, AsyncStorage
- Backend: Node.js, Express, SQLite, express-validator, bcryptjs

Este documento resume a arquitetura; mantenha decisões técnicas importantes no controle de versão quando necessário.
