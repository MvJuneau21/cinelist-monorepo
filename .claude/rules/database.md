---
paths:
  - "apps/api/**/*.py"
---

# Banco de dados (PostgreSQL + SQLAlchemy 2)

## Como o schema nasce e muda

- As tabelas são criadas por `create_all` quando a API sobe. **Não existe ferramenta de migração.**
  Isso quer dizer que:
  - tabela nova: é criada sozinha no próximo start;
  - coluna nova, renomeada ou com tipo alterado numa tabela **existente**: não é aplicada. Avise no plano
    que o banco de dev precisa ser recriado ou alterado à mão, e proponha o SQL. Não presuma que a
    mudança "simplesmente vai funcionar".
- Todo modelo novo precisa ser importado no ponto de entrada antes do `create_all`, senão a tabela não
  é criada.

## Modelagem

- Chave primária inteira autoincremental chamada `id`. A referência ao usuário é `user_id` com FK para
  a tabela de usuários e `relationship` com `back_populates` dos dois lados.
- Mídias externas não têm tabela de catálogo. Guardamos o **id externo** (do TMDB/AniList) e o
  `media_type` junto com os dados que o usuário produz. Avaliações ficam numa tabela por tipo de mídia
  e guardam uma cópia dos metadados da mídia no momento da avaliação.
- Relação pai → filhos que só existem com o pai (lista → itens) usa `cascade="all, delete-orphan"` no
  ORM **e** `ondelete="CASCADE"` na FK.
- Unicidade de domínio (uma avaliação por usuário+mídia, uma mídia por lista) é checada **na rota**,
  com resposta 409, antes de inserir.

## Sessão

- A sessão chega na rota por injeção de dependência do FastAPI (a mesma que as rotas existentes usam), uma por request, e é fechada no final.
- Escrita: `add` → `commit` → `refresh` e só então devolver o objeto (assim `id` e defaults vêm preenchidos).
- Não abra sessão manual dentro de serviço ou de helper.
