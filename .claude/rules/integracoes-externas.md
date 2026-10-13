---
paths:
  - "apps/api/**"
  - "apps/web/src/**"
---

# Integrações externas (TMDB e AniList) e o campo `media_type`

## Provedores

- **Filmes e séries → TMDB** (REST, chave no `.env` da API). **Animes → AniList** (GraphQL, sem chave).
- Toda chamada externa fica na camada de serviços da API, um módulo por provedor. Rota e front nunca
  chamam o provedor direto.
- Serviço externo que falha **não derruba a rota**: loga e devolve vazio/`None`, e a rota decide o
  status (404 quando a mídia pedida não existe).
- O TMDB pagina de 20 em 20. Quem pede N itens pega as páginas necessárias e corta no limite.

## `media_type`: o campo que mais quebra entre front e back

- Valores aceitos pela API: **`movie`, `serie`, `anime`**. É `serie`, no singular e em português.
- O TMDB chama série de `tv`. Quando um objeto vindo do TMDB vai para a API, converta `tv` → `serie`
  (o front já faz isso nas telas que avaliam e adicionam a listas).
- Os campos não são iguais entre tipos: anime usa `score` onde filme e série usam `rating`; anime usa
  `description` onde os outros usam `overview`; o título de anime vem como objeto (`romaji`/`english`).
  Ao criar algo que serve para "qualquer mídia", trate as três formas e teste com um item de cada tipo.

## Imagens

- `poster_path`/`backdrop_path` podem ser **caminho relativo do TMDB** (precisa do prefixo do CDN de
  imagens + tamanho) ou **URL absoluta do AniList**. Quem renderiza resolve os dois casos. Quem grava
  no banco grava o valor como veio.
