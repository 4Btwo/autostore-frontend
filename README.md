# AutoStore Backend — v2.0

Marketplace de peças automotivas. Backend Node.js/Express com Firebase Firestore e Mercado Pago.

---

## Configuração inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```env
# Firebase (desenvolvimento local)
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token_aqui
MP_WEBHOOK_SECRET=seu_webhook_secret_aqui

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# ApiBrasil (opcional — consulta de placa/chassi)
APIBRASIL_BEARER_TOKEN=seu_token
APIBRASIL_DEVICE_TOKEN=seu_device_token
```

### 3. Rodar localmente

```bash
npm run dev
```

---

## Deploy no Render

### Passo 1 — Codificar credenciais Firebase

```bash
node scripts/encodeServiceAccount.js
```

Copie o valor impresso.

### Passo 2 — Configurar variáveis no Render

Acesse o [dashboard do Render](https://dashboard.render.com) → seu serviço → **Environment** e adicione:

| Variável | Valor |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_B64` | Valor gerado pelo script acima |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL do seu frontend |
| `BACKEND_URL` | URL do Render (ex: `https://autostore-backend.onrender.com`) |
| `MP_ACCESS_TOKEN` | Token do Mercado Pago |
| `MP_WEBHOOK_SECRET` | Secret do webhook MP |
| `CLOUDINARY_CLOUD_NAME` | Suas credenciais Cloudinary |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |

### Passo 3 — Configurar webhook no Mercado Pago

No painel do Mercado Pago → Suas integrações → Webhooks, configure:

- **URL**: `https://seu-backend.onrender.com/payments/webhook`
- **Eventos**: `payment`
- Copie o **secret** gerado e cole em `MP_WEBHOOK_SECRET` no Render

---

## Deploy das regras e índices do Firestore

```bash
# Instalar Firebase CLI (apenas uma vez)
npm install -g firebase-tools

# Login
firebase login

# Selecionar projeto
firebase use autostore-830b4

# Deploy das regras de segurança
firebase deploy --only firestore:rules

# Deploy dos índices
firebase deploy --only firestore:indexes

# Deploy completo (regras + índices)
firebase deploy --only firestore
```

---

## Promover usuário a admin

```bash
node --env-file=.env scripts/setAdmin.js <UID_DO_USUARIO>
```

O UID está no Firebase Console → Authentication → usuário. Após rodar, o usuário precisa fazer logout e login novamente.

---

## Estrutura do projeto

```
src/
├── app.js                    # Express + middlewares + rotas
├── server.js                 # Entry point
├── config/
│   └── firebase.js           # Firebase Admin (único arquivo)
├── controllers/              # Recebe request, chama service
├── services/                 # Lógica de negócio
├── repositories/             # Queries ao Firestore
├── routes/                   # Definição de rotas + validação
├── middlewares/
│   ├── authMiddleware.js     # authenticate + requireAdmin (Custom Claims)
│   ├── rateLimiter.js        # Rate limiting por tipo de rota
│   ├── validate.js           # Schemas Zod + middleware validate()
│   └── error.middleware.js   # Error handler global
├── utils/
│   ├── logger.js             # Logger estruturado (JSON em prod)
│   └── response.js           # successResponse / errorResponse
└── errors/
    └── AppError.js           # Erros com statusCode e code

firebase/
├── firestore.rules           # Regras de segurança do Firestore
└── firestore.indexes.json    # Índices compostos

scripts/
├── encodeServiceAccount.js   # Gera FIREBASE_SERVICE_ACCOUNT_B64
├── setAdmin.js               # Promove usuário a admin
└── seed*.js                  # Seeds de dados
```

---

## Melhorias da v2.0

- **Segurança**: credenciais nunca no repositório; webhook MP com validação HMAC-SHA256
- **Concorrência**: estoque com Firestore Transaction — sem race condition
- **Escalabilidade**: batching de queries — sem limite de 10 IDs
- **Performance**: N+1 corrigido em admin e reviews; moderationStatus indexado
- **Admin**: Custom Claims — verificação O(0) sem roundtrip ao banco
- **Rate limiting**: proteção em todas as rotas públicas e sensíveis
- **Validação**: Zod em todos os inputs da API
- **Logs**: JSON estruturado em produção
- **Arquitetura**: arquivos Firebase duplicados consolidados; routes.js legado removido
- **Moderação**: anúncios novos ficam `active: false` até aprovação; vendedores premium aprovados automaticamente
