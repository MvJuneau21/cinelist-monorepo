# CineList (monorepo)

Aplicação para pesquisar, avaliar e organizar em listas filmes, séries e animes.
Antes eram dois repositórios (`cinelist-backend` e `cinelist-frontend`). Os dois foram unidos aqui com
`git subtree`, e o histórico de commits de cada um foi preservado.

```
cinelist/
├── apps/
│   ├── api/                 FastAPI + SQLAlchemy + PostgreSQL   (@cinelist/api)
│   └── web/                 React + Vite + Tailwind             (@cinelist/web)
├── packages/
│   └── api-client/          tipos, client, hooks e mocks gerados pelo Kubb (@cinelist/api-client)
├── .claude/rules/           regras do agente que cruzam workspaces (banco, auth, integrações)
├── .github/workflows/ci.yml pipeline única: contrato + build
├── CLAUDE.md                regras gerais do agente (mapa do monorepo)
└── README_JUSTIFICATIVA.md  por que está organizado assim
```

## Rodando

Pré-requisitos: Node 20+, Python 3.10+, PostgreSQL.

```bash
npm install

# API (uma vez)
cd apps/api
python -m venv .venv && .venv\Scripts\activate    # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                               # preencher DATABASE_URL e TMDB_API_KEY
cd ../..

npm run dev:api     # http://localhost:8000/docs
npm run dev:web     # http://localhost:5173
```

## Contrato API ↔ front

```bash
npm run generate    # apps/api → openapi.json → packages/api-client/src/gen
```

O `openapi.json` e o código gerado são versionados. O CI regenera os dois e falha se houver diferença,
ou seja, uma mudança na API sem o client atualizado não passa.
