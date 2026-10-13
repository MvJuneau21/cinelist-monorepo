---
paths:
  - "apps/api/**"
  - "apps/web/src/**"
---

# Autenticação: estado real e regras

## Como está hoje (leia antes de assumir qualquer coisa)

- **Não existe autenticação real.** O login e o cadastro do front são simulados: guardam um usuário
  local (nome derivado do e-mail) e um token fixo de demonstração. A API **não valida token**.
- A API identifica o usuário pelo `user_id` que vem no corpo da requisição e confere se ele existe.
- O usuário simulado do front não tem `id`. Por isso as telas que falam com a API usam um id de usuário
  fixo de desenvolvimento, repetido em várias páginas.
- O client HTTP já envia `Authorization: Bearer <token>` e redireciona para o login em 401. Ou seja, o
  front já está pronto para quando a API passar a exigir token.

## Regras

- **Não implemente auth de verdade como efeito colateral de outra feature.** É uma mudança de contrato
  em todas as rotas e merece uma tarefa e um plano próprios.
- Rota nova que age em nome do usuário segue o padrão atual: recebe `user_id`, devolve 404 se o usuário
  não existe e confere que o recurso alterado pertence a ele.
- No front, **não espalhe mais ids fixos**. Feature nova lê o id do usuário de um único lugar (o contexto
  do usuário). Se ele ainda não tiver `id`, adicione lá o id de dev uma vez, para que a troca futura seja
  feita num lugar só.
- Nunca logue senha nem token e nunca devolva o campo de senha em schema de saída.
