# Transcrição — planejamento de feature em plan mode

- Ferramenta: Claude Code 2.1.296 (CLI), modelo `claude-opus-5-5`
- Modo de permissão: `plan` (o agente só pode ler; nenhuma edição é permitida)
- Diretório: raiz do monorepo `cinelist-monorepo/`
- Duração: 131s, 12 turnos
- Sessão bruta (todas as chamadas de ferramenta e respostas): `sessao.jsonl`

## Prompt enviado

> Quero implementar a feature de Favoritos no CineList: o usuário marca/desmarca qualquer mídia (filme, série ou anime) como favorita na tela de detalhes da mídia, e vê todos os favoritos numa aba nova do Perfil.
>
> Use a feature de Listas como referência de padrão, tanto na API quanto no front. Planeje a implementação ponta a ponta — banco, rotas, contrato/client gerado e telas — seguindo o CLAUDE.md e as regras de cada contexto. Aponte onde Favoritos deve seguir Listas e onde deve divergir dela por causa das regras. Não implemente nada ainda, só o plano.

## O que o agente consultou (em ordem)

1. **Glob**

   ```
   {"pattern": "**/*.{md,py,jsx,js,json}", "path": "C:\\Users\\marcu\\cinelist-monorepo"}
   ```

2. **Bash** — List config dirs and print all rule files

   ```
   ls .claude .claude/rules docs packages packages/* .github -R 2>/dev/null | head -80; cat .claude/rules/*.md apps/api/CLAUDE.md apps/web/CLAUDE.md packages/api-client/CLAUDE.md
   ```

3. **Bash** — Print API main, list models and schemas

   ```
   cd apps/api && cat app/main.py app/models/__init__.py app/models/lista.py app/models/lista_item.py app/models/user.py app/schemas/lista_schema.py app/config.py; ls app/api/routes; ls scripts
   ```

4. **Bash** — Show list-related routes in media router

   ```
   grep -n "lista\|Lista\|@media_router\|def \|HTTPException\|import" app/api/routes/media_router.py | head -150
   ```

5. **Bash** — Print web context, routes, list service and user id usage

   ```
   cd apps/web && cat src/context/UserContext.jsx src/App.jsx src/services/lists.js package.json; grep -n "user_id\|userId\|USER_ID\|= 1\b" -r src | head -40
   ```

6. **Bash** — Read add_item, rate route, Profile page and main.jsx

   ```
   cd  && sed -n 350,400p apps/api/app/api/routes/media_router.py; sed -n 96,135p apps/api/app/api/routes/media_router.py; cat apps/web/src/pages/Profile.jsx; cat apps/web/src/main.jsx
   ```

7. **Bash** — Read MediaDetails, image helpers, package/kubb/CI configs

   ```
   cd  && cat apps/web/src/pages/MediaDetails.jsx; grep -n "getImage\|image.tmdb\|const .*Url\|function .*Image" -r apps/web/src | head; cat package.json packages/api-client/package.json packages/api-client/kubb.config.ts .github/workflows/ci.yml apps/api/package.json
   ```

8. **Bash** — Check generated client usage, axios config and media navigation

   ```
   grep -rn "api-client" apps/web/src | head; cat packages/api-client/src/gen/clients/getListasByUser.ts; ls packages/api-client/src/gen/mocks | head -50; cat apps/web/src/services/api.js; grep -n "navigate(\`/media\|state:" -r apps/web/src | head; cat apps/web/src/components/MediaCard.jsx | head -40
   ```

9. **Bash** — Inspect generated query hook, Kubb client, MediaCard and provider fields

   ```
   cat packages/api-client/src/gen/hooks/useListTopMovies.ts | head -60; ls -a packages/api-client/src/gen; grep -n "interceptor\|baseURL\|setConfig\|export const client\|export function client" -r packages/api-client/src/gen/.kubb 2>/dev/null | head; sed -n 40,120p apps/web/src/components/MediaCard.jsx; grep -n "type:" -r apps/web/src/pages/*.jsx | head; grep -n "def get_anime_details\|def get_movie_details\|def get_series_details" -A25 apps/api/app/services/*.py | grep -n "coverImage\|bannerImage\|description\|query\|poster\|def " | head -20
   ```

10. **Bash** — Check how ratings copy image metadata per provider

   ```
   grep -n "coverImage\|bannerImage\|poster_path=\|backdrop_path=\|image=\|overview=\|description=" apps/api/app/api/routes/media_router.py; grep -n "Column" apps/api/app/models/anime.py
   ```

11. **Write** — grava o plano no arquivo de planos do Claude Code (única escrita permitida em plan mode; íntegra abaixo)

## Resposta final do agente no chat

O plano de Favoritos está pronto e salvo em `C:\Users\marcu\.claude\plans\quero-implementar-a-feature-radiant-wall.md`. Não implementei nada.

**O plano em poucas linhas**
- **Banco:** uma tabela nova `favoritos` (`FavoritoModel`) com `user_id` (chave estrangeira com `CASCADE`), `media_type`, `media_id` e uma cópia dos metadados da mídia (título, poster, backdrop, overview). Também ganha `created_at` e um `relationship` com `UserModel`. Como é tabela nova, o `create_all` cria sozinha: não precisa de SQL nem de recriar o banco. Só falta importar o modelo no `main.py`.
- **Rotas:** ficam num router próprio `/favoritos`. São três:
  - `create_favorito` (POST)
  - `list_favoritos` (GET `?user_id=`)
  - `delete_favorito` (DELETE `/{id}?user_id=`)

  Todas têm `response_model` e `summary` em português. A validação segue a ordem: usuário (404) → `media_type` (400) → duplicidade (409) → provedor (404).
- **Contrato:** `npm run generate` gera `useCreateFavorito`, `useListFavoritos` e `useDeleteFavorito`, além dos mocks.
- **Telas:** um coração na tela de detalhes, ao lado do título, e uma seção "Meus Favoritos" no Perfil com um card de métrica a mais. A seção reaproveita o `MediaCard`. Depois de favoritar ou remover, a lista é atualizada sozinha, sem recarregar a página.

**Onde Favoritos segue Listas:** chave `id` + `user_id`, id externo da mídia + `media_type`, duplicidade checada na rota com 409, título e imagens buscados no TMDB/AniList pelo id (o front não manda esses dados) e conferência do dono antes de apagar.

**Onde diverge, e por qual regra:**
- **Router próprio:** a API diz para não aumentar o `media_router`.
- **Leitura com `GET`:** Listas usa `POST .../get`, que é dívida registrada.
- **DELETE sem corpo e com schema de saída:** o delete de Listas devolve um `dict` solto.
- **Ordem de validação completa:** o `add_item` de Listas não confere se o usuário existe.
- **Cópia dos metadados:** segue o padrão das avaliações, para que o Perfil e a tela de detalhes consigam mostrar o favorito sem buscar de novo.
- **No front:** usa os hooks gerados em vez de um `services/favoritos.js`, pega o `userId` do `UserContext` em vez de outro `FIXED_USER_ID`, mostra um estado vazio completo e atualiza a lista sozinha em vez de recarregar tudo na mão.

**Três pontos para você decidir**
1. **"Aba" no Perfil:** o Perfil hoje não tem abas, só seções empilhadas. Planejei uma seção nova no mesmo formato. Se você quer abas de verdade, isso muda o layout do Perfil inteiro.
2. **O client gerado não envia o token nem trata 401.** Favoritos é a primeira tela a usar os hooks gerados. Hoje não quebra nada, porque a API não valida token. Mesmo assim, recomendo configurar uma vez no front o mesmo comportamento do `services/api.js` (enviar o token e redirecionar em 401), sem editar o código gerado. Diga se prefere deixar isso para outra tarefa.
3. **As telas antigas continuam com o id fixo:** coloco o id de desenvolvimento (10) só no `UserContext` e uso de lá no código novo. As páginas antigas ficam com o `FIXED_USER_ID` delas por enquanto. Trocar todas é outra tarefa.

Se aprovar o plano, com ou sem ajustes nesses três pontos, sigo para a implementação.

## Plano completo (arquivo gerado em plan mode)

## Plano: Favoritos (filme, série, anime)

### Contexto
O usuário quer marcar e desmarcar qualquer mídia como favorita na tela de detalhes (`/media/:id`) e ver
todos os favoritos no Perfil. A referência é Listas (`ListaModel`/`ListaItemModel`, rotas `/media/listas/*`,
`services/lists.js`, seção "Minhas Listas" do `Profile.jsx`). Favoritos é mais simples que Listas: não há
pai/filho, só uma relação usuário → mídia externa.

Observação: o Perfil hoje não tem abas. Ele tem seções empilhadas (Métricas, Avaliações, Listas). A "aba
nova" vira uma **seção "Meus Favoritos"** no mesmo formato, mais um card de métrica.

### Segue Listas / diverge de Listas

| Aspecto | Segue Listas | Diverge (regra que manda) |
|---|---|---|
| Modelo | `id` autoincremental, `user_id` FK, `media_type` + `media_id` externo, `relationship` com `back_populates` | Guarda **cópia dos metadados** (título, poster, backdrop, overview) como as avaliações, não só `media_title` (`database.md`) |
| Unicidade | Checada na rota, com 409 | — |
| Router | — | **Router próprio** `/favoritos`, não cresce o `media_router` (`apps/api/CLAUDE.md`) |
| Leitura | — | **`GET` com query param**, não `POST .../get` com corpo (vira `useQuery`) |
| Delete | Confere o dono antes de apagar | Usa path/query em vez de corpo no DELETE e tem **`response_model`** (o `delete_lista` devolve `dict` solto) |
| Ordem de validação | — | usuário → `media_type` → duplicidade → provedor → insert (o `add_item` não confere o usuário e valida o tipo depois da duplicidade) |
| Busca de título/imagem | Rota chama o serviço do provedor pelo `media_id` (igual `add_item`/`rate`), sem confiar no que o front manda | — |
| Front: dados | — | **Hooks gerados** (`@cinelist/api-client/hooks`), sem `services/favoritos.js` em axios. As partes antigas de MediaDetails e Profile continuam nos services |
| Front: user id | — | Lê `userId` do `UserContext`, **sem** `FIXED_USER_ID` novo (`auth.md`) |
| Front: estado vazio | — | Ícone + título + explicação + botão (as seções de Listas e Avaliações só têm texto) |
| Front: atualização | — | Invalida a query depois da mutation (o Profile de Listas chama `fetchProfileData()` de novo) |

### 1. API — banco

**Novo** `apps/api/app/models/favorito.py`, `FavoritoModel`, tabela `favoritos`:
- `id` (PK, autoincremental)
- `user_id` (FK `users.id`, `ondelete="CASCADE"`, `nullable=False`)
- `media_type` (`String`: `movie`/`serie`/`anime`) e `media_id` (`Integer`, id do TMDB/AniList)
- `media_title` (`String`, não nulo); `poster_path`, `backdrop_path`, `overview` (`String`, podem ser nulos). Imagens gravadas como vieram, ou seja, caminho relativo do TMDB ou URL do AniList
- `created_at` (`DateTime`, `server_default=func.now()`) para ordenar do mais recente para o mais antigo
- `user = relationship("UserModel", back_populates="favoritos")`

**Editar** `apps/api/app/models/user.py`: `favoritos = relationship("FavoritoModel", back_populates="user", cascade="all, delete-orphan")`.

**Editar** `apps/api/app/main.py`: importar `FavoritoModel` antes do `create_all`.

Schema do banco: a tabela é nova e o `create_all` cria sozinho. O `relationship` em `UserModel` não muda
colunas de `users`, então **não precisa de SQL manual nem de recriar o banco**.

### 2. API — schemas e rotas

**Novo** `apps/api/app/schemas/favorito_schema.py`:
- `FavoritoCreate { user_id: int, media_type: str, media_id: int }`
- `FavoritoOut { id, user_id, media_type, media_id, media_title, poster_path?, backdrop_path?, overview?, created_at }` com `from_attributes`
- `FavoritoDeleteOut { message: str, id: int }`

`media_type` fica como `str` e é validado na rota, para responder 400 como pede a tabela de erros. Um `Literal` responderia 422.

**Novo** `apps/api/app/api/routes/favorito_router.py`, registrado em `main.py` com `prefix="/favoritos"` e `tags=["Favoritos"]`:

| Função (= operationId) | Método/rota | Saída | Regras |
|---|---|---|---|
| `create_favorito` | `POST /favoritos` | `FavoritoOut` | 404 "Usuário não encontrado"; 400 "Tipo de mídia inválido"; 409 "Essa mídia já está nos seus favoritos"; busca no provedor (`get_movie_details`/`get_series_details`/`get_anime_details`), 404 "Filme/Série/Anime não encontrado na API"; `add`→`commit`→`refresh` |
| `list_favoritos` | `GET /favoritos?user_id=` | `List[FavoritoOut]` | 404 se o usuário não existe; ordena por `created_at desc` |
| `delete_favorito` | `DELETE /favoritos/{favorito_id}?user_id=` | `FavoritoDeleteOut` | 404 se o usuário não existe; 404 "Favorito não encontrado para este usuário" quando o id não é dele |

Extração dos metadados por tipo: igual a `rate` em `media_router.py:136-197`. Filme usa
`title`/`poster_path`/`backdrop_path`/`overview`. Série usa `name` + os mesmos campos. Anime usa
`title.romaji || english`, `coverImage.large`, `bannerImage`, `description`. Hoje essa lógica está
espalhada dentro de `rate` e de `add_item`. Vou extrair um helper pequeno **dentro do router de favoritos**
e não vou refatorar o `media_router`, porque isso fica fora do escopo.

Não há rota "é favorito?". A tela de detalhes usa `list_favoritos`, que já está no cache compartilhado
com o Perfil, e procura a mídia pelo par (`media_type`, `media_id`). Os favoritos de um usuário são poucos,
então isso dá uma rota a menos e uma invalidação só.

### 3. Contrato

`npm run generate` na raiz. Isso gera `useCreateFavorito`, `useListFavoritos` + `listFavoritosQueryKey`,
`useDeleteFavorito`, os tipos e as factories `createFavoritoOut()` etc. Nada em `packages/api-client/src/gen`
é editado à mão.

**Ponto de atenção:** esta é a primeira tela a usar os hooks gerados de verdade. O client do Kubb tem
uma instância axios própria e **não envia `Authorization` nem redireciona em 401**, ao contrário de
`apps/web/src/services/api.js`. Hoje isso não quebra nada, porque a API não valida token. Recomendo
registrar uma vez o mesmo interceptor no `client` gerado (via `client.interceptors` / `setConfig`) num
arquivo de setup do front, por exemplo `apps/web/src/services/apiClient.js` importado em `main.jsx`. Isso é
configuração do app, não edição de código gerado, e também não é implementar auth.

### 4. Front

**`apps/web/src/context/UserContext.jsx`**: definir `DEV_USER_ID = 10` só aqui e expor
`userId = user ? (user.id ?? DEV_USER_ID) : null` no `value`. As páginas antigas continuam com o
`FIXED_USER_ID` delas, já que migrar tudo é outra tarefa. Todo código novo usa `useUser().userId`.

**`apps/web/src/pages/MediaDetails.jsx`** (botão de favoritar ao lado do título):
- `const mediaType = media.type === 'tv' ? 'serie' : media.type` (mesma conversão da linha 64)
- `useListFavoritos({ user_id: userId })` → `favorito = data?.find(f => f.media_type === mediaType && f.media_id === media.id)`
- Botão `Heart` (lucide): preenchido quando é favorito. Ao clicar, chama `deleteFavorito({ favorito_id, user_id })` ou `createFavorito({ user_id, media_type, media_id })`. Fica desabilitado enquanto a mutation está pendente
- Em `onSuccess`: `queryClient.invalidateQueries({ queryKey: listFavoritosQueryKey({ user_id: userId }) })` e `showMessage('Adicionado aos favoritos!' / 'Removido dos favoritos.', 'success')`. Em `onError`: `error.response?.data?.detail` ou um texto padrão
- Avaliação continua no `rateMedia` do service, como está hoje

**`apps/web/src/pages/Profile.jsx`**:
- 4º card de métrica "Favoritos" com `Heart` (grid de `md:grid-cols-3` para `md:grid-cols-2 lg:grid-cols-4`)
- Nova seção "Meus Favoritos" depois de "Minhas Listas", com o mesmo contêiner `bg-white rounded-xl shadow-md p-8`
- `useListFavoritos({ user_id: userId })`. Enquanto carrega: `<LoadingSpinner text="Carregando seus favoritos..." />`
- Grid de **`MediaCard`** (reaproveitado, sem card novo). Um `normalizeFavorito` transforma
  `{ id: media_id, type: media_type, title: media_title, poster_path, backdrop_path, overview }`. O clique leva
  para `/media/:id` com `state.media`, e o MediaDetails consegue renderizar porque gravamos os metadados. O
  `onRemoveFromList` do card remove o favorito (`useDeleteFavorito` + invalidação + mensagem).
  *O tooltip do card diz "Remover da lista". Se incomodar, adicionamos uma prop `removeLabel` opcional.*
- Estado vazio: ícone `Heart`, título "Nenhum favorito ainda", explicação "Marque o coração na página de uma
  mídia para guardá-la aqui." e botão "Explorar mídias" que leva a `/home`
- Avaliações e Listas continuam no `fetchProfileData` antigo

Como o `MediaCard` e o MediaDetails já resolvem a URL da imagem, **nenhum lugar novo precisa do
`getImageUrl`**. Então não há cópia nova e não é preciso extrair utilitário agora.

Para desenvolver sem a API: `createFavoritoOut()` dos mocks monta os estados vazio, 1 item e muitos itens,
com um de cada `media_type`.

### 5. Commit
Um único commit: `feat: adiciona favoritos de mídias no detalhe e no perfil`, com API, `openapi.json`,
`packages/api-client/src/gen` e front.

### Verificação
1. `npm run dev:api` e conferir em `/docs` a tag "Favoritos" com as 3 rotas, cada uma com `summary` e schema de saída.
2. No Swagger, com `user_id=10`: favoritar um filme, uma série (`serie`) e um anime → 200. Repetir um → 409. `media_type="tv"` → 400. `user_id` inexistente → 404. Apagar o favorito de outro usuário → 404. Conferir `poster_path` relativo (TMDB) e absoluto (AniList) gravados.
3. `npm run generate` e `git diff --exit-code -- apps/api/openapi.json packages/api-client/src/gen` depois de commitar (a mesma checagem do CI).
4. `npm run dev:web`: em `/media/:id` de um item de cada tipo, marcar e desmarcar → mensagem + coração muda. Abrir o Perfil → a seção aparece sem recarregar (invalidação), as imagens dos três tipos carregam, o card abre o detalhe já com o coração marcado, remover pelo card atualiza o contador. Com 0 favoritos aparece o estado vazio.
5. `npm run build` na raiz.
