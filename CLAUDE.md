# CineList — regras gerais do monorepo

CineList é uma aplicação para pesquisar, avaliar (nota de 0 a 10 + comentário) e organizar em listas
filmes, séries e animes. Os dados das mídias vêm de APIs externas (TMDB para filmes e séries, AniList
para animes). O que é do usuário (avaliações e listas) fica no PostgreSQL.

Este arquivo é o mapa. As regras de cada contexto ficam em arquivos próprios, que são carregados quando
você trabalha naquele contexto. Leia o arquivo do contexto antes de mexer nele.

## Workspaces

| Workspace | Papel | Regras |
|---|---|---|
| `apps/api` | API REST em Python (FastAPI + SQLAlchemy + Pydantic). Dona do contrato. | `apps/api/CLAUDE.md` |
| `apps/web` | SPA em React (JSX, Vite, Tailwind, React Router). Consome a API. | `apps/web/CLAUDE.md` |
| `packages/api-client` | Tipos, client axios, hooks React Query e mocks Faker **gerados** a partir do OpenAPI da API. | `packages/api-client/CLAUDE.md` |

Regras que atravessam mais de um workspace ficam em `.claude/rules/`:
- `database.md`: modelagem, sessões e o que acontece quando o schema muda
- `auth.md`: o estado real da autenticação (hoje é simulada) e como não piorar isso
- `integracoes-externas.md`: TMDB/AniList, ids externos, imagens e o campo `media_type`

## Comandos (rodar da raiz)

```bash
npm install                      # dependências JS de todos os workspaces
npm run install:py -w @cinelist/api   # dependências Python (com o venv de apps/api ativo)
npm run dev:api                  # API em http://localhost:8000 (Swagger em /docs)
npm run dev:web                  # front em http://localhost:5173
npm run generate                 # exporta o OpenAPI da API e regenera packages/api-client
npm run build                    # generate + build do front (o mesmo que o CI faz)
```

## Como uma feature atravessa o monorepo

A API é a fonte da verdade e o front nunca adivinha o formato de um endpoint. A ordem é sempre esta:

1. **Banco e domínio** na API (ver `.claude/rules/database.md`).
2. **Rota + schemas de entrada e saída** na API, com `response_model` e `summary`. Isso vira o Swagger.
3. **`npm run generate`**: atualiza `apps/api/openapi.json` e o client em `packages/api-client`.
4. **Front** consome os hooks/clients gerados. Para desenvolver a tela sem a API rodando, use as
   factories de mock geradas.
5. **Commit único** com os dois lados + o contrato regenerado. O CI falha se o contrato commitado
   não bater com o que a API gera.

Antes de implementar uma feature nova, planeje em plan mode e escolha uma **feature existente parecida
como referência**. A feature de **Listas** é a referência ponta a ponta mais completa: tem modelo com
relacionamento, rotas de CRUD com checagem de dono, schemas de entrada/saída, chamadas no front, página,
modal e aba no perfil. Siga o padrão dela, a menos que as regras do contexto digam o contrário. Quando
divergirem, a regra vence, porque Listas tem algumas dívidas registradas nos arquivos de contexto.

## Convenções gerais

- Textos para o usuário (UI, mensagens de erro da API, `summary` das rotas) em **português**.
- Nomes de campos do contrato **não são traduzidos nem renomeados** de um lado só. Se a API diz `nome`,
  o front usa `nome`. Mudança de nome é uma mudança de contrato e mexe nos dois lados no mesmo commit.
- Commits no padrão `tipo: descrição em português no presente` (`feat: adiciona ...`, `fix: corrige ...`,
  `refactor: ...`, `chore: ...`), como no histórico.
- Não edite código gerado nem crie segredo em arquivo versionado (as chaves ficam no `.env` da API).
