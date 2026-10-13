# API (FastAPI): padrões

A API é a dona do contrato. Tudo o que você declara aqui (tipos, nomes de função, códigos de erro e
descrições) aparece no Swagger e vira código no front via Kubb. Escreva pensando nos dois consumidores:
o humano que lê o `/docs` e o gerador.

## Camadas

Cada uma tem sua pasta própria. Não misture camadas no mesmo módulo.

- **Rotas**: recebem a requisição, validam regra de negócio, orquestram e respondem. Sem SQL cru e sem
  chamada HTTP direta a serviço externo.
- **Schemas (Pydantic)**: o formato de entrada e de saída de cada rota. São separados dos modelos ORM.
  Schemas de saída que leem do ORM usam `from_attributes`.
- **Modelos (SQLAlchemy)**: tabelas e relacionamentos (ver `.claude/rules/database.md`).
- **Serviços externos**: um módulo por provedor (TMDB, AniList), devolvendo dicionários já buscados
  (ver `.claude/rules/integracoes-externas.md`).

## Rotas

- Cada recurso tem o seu router, registrado no ponto de entrada com `prefix` e `tags` próprios.
  *Dívida conhecida:* avaliações e listas vivem hoje dentro do router de mídia (`/media/...`). Não
  aumente esse router: um recurso novo ganha router próprio.
- Toda rota declara **`response_model`** e **`summary`** em português. Uma rota sem `response_model`
  vira `unknown` no client gerado e o front perde a tipagem. Várias rotas antigas devolvem `dict` solto:
  quando tocar numa delas, aproveite para dar um schema de saída a ela.
- O **nome da função da rota é o `operationId`**, que vira o nome do client/hook no front
  (`create_lista` → `useCreateLista`). Use nomes `verbo_recurso` em snake_case, únicos na API inteira.
- **Leitura usa `GET`** (com parâmetros de path/query), e escrita usa `POST`/`PUT`/`DELETE`. O gerador
  transforma `GET` em `useQuery` (cache, refetch, loading) e o resto em `useMutation`.
  *Dívida conhecida:* as leituras antigas são `POST .../get` com o id no corpo e por isso viram mutation
  no front. Não crie leituras novas nesse formato.
- Operações do usuário recebem o `user_id` explicitamente e **conferem que o recurso pertence a ele**
  antes de alterar ou apagar (ver `.claude/rules/auth.md`).

## Erros

Use `HTTPException` com `detail` em português, legível para o usuário final. O front mostra esse texto.

| Situação | Status |
|---|---|
| Usuário, recurso local ou mídia externa não encontrados | 404 |
| Regra de domínio violada (nota fora de 0 a 10, `media_type` inválido) | 400 |
| Duplicidade (mesma mídia avaliada duas vezes, item já na lista) | 409 |
| Corpo fora do schema | 422 (automático do FastAPI) |

A ordem de validação segue as rotas existentes: usuário existe → regra de domínio → duplicidade → efeito.

## Depois de mudar qualquer rota ou schema

Rode `npm run generate` na raiz e commite `openapi.json` e `packages/api-client` junto com a mudança.
O CI compara os dois.
