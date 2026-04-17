# AutoStore — Frontend

Aplicativo React mobile-first para marketplace de peças automotivas.

## Tecnologias

- React 18
- Vite
- Tailwind CSS
- Firebase (Auth + Firestore client)

## Requisitos

- Node.js 18+
- Backend AutoStore rodando (local ou Render)

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local com seus dados Firebase e a URL do backend

# 3. Iniciar em modo desenvolvimento
npm run dev
```

O app abre em `http://localhost:5173`.

## Deploy no Vercel

1. Conecte o repositório no [Vercel](https://vercel.com)
2. Framework preset: **Vite**
3. Configure as variáveis de ambiente no painel do Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_API_URL` — URL do backend no Render

## Estrutura

```
src/
├── config/
│   └── firebase.js          # Firebase client SDK (Auth + Firestore)
├── App.jsx                  # Componente raiz + todas as telas
└── AdminModeracaoScreen.jsx # Tela de moderação admin
firebase/
├── firestore.rules          # Regras de segurança do Firestore
└── firestore.indexes.json   # Índices do Firestore
```

## Regras do Firestore

Para fazer deploy das regras de segurança:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Login
firebase login

# Deploy das regras
firebase deploy --only firestore:rules,firestore:indexes
```
