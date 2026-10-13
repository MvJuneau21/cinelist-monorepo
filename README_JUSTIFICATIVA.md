# Justificativa da organização do CineList

## De onde eu parti

O CineList era um projeto de faculdade dividido em dois repositórios: `cinelist-backend` (FastAPI) e
`cinelist-frontend` (React). Antes de reorganizar, encontrei três problemas que mostram o custo dessa
separação:

1. **O contrato quebrava em silêncio.** Na tela de listas há um comentário
   `CORREÇÃO: 'list.name' para 'list.nome' para corresponder ao backend`. O front tinha chutado um nome
   de campo e só descobriu o erro rodando. Nada ligava a resposta da API ao código do front.
2. **Bug que só aparece em outro sistema operacional.** O componente raiz importava `./components/Navbar`,
   mas o arquivo se chama `NavBar.jsx`. No Windows funciona. No Linux (CI ou deploy) o build quebra.
   Corrigi o import na migração.
3. **O agente via só metade do sistema.** Com o Claude Code aberto no front, ele não tinha como saber
   que a API espera `media_type = "serie"` (e não `"tv"`, como vem do TMDB), nem que anime usa `score`
   em vez de `rating`.

## 1. Estrutura do monorepo

```
apps/api              @cinelist/api         Python, mas com package.json só para orquestrar scripts
apps/web              @cinelist/web         React/Vite
packages/api-client   @cinelist/api-client  gerado pelo Kubb a partir do OpenAPI da API
```

- **npm workspaces**, porque já era a ferramenta do front e não acrescenta nada novo para instalar.
  A API é Python, então ela ganhou um `package.json` mínimo que só expõe `dev`, `install:py` e
  `openapi`. Assim, todos os comandos rodam da raiz do mesmo jeito (`npm run dev:api`, `npm run dev:web`).
- **Histórico preservado com `git subtree`.** Os 81 commits dos dois repositórios continuam no log, com
  os autores originais. Para um projeto em grupo, isso importa.
- **`apps/` vs `packages/`.** Em `apps/` fica o que é implantado. Em `packages/` fica o que é consumido
  por outro workspace. O `api-client` é o pacote que liga os dois lados.
- **Contrato versionado + CI único.** O FastAPI já gera o Swagger. Um script exporta esse schema para
  `apps/api/openapi.json`, e o Kubb gera tipos, client axios, hooks do React Query e factories de mock
  (Faker). O CI regenera tudo e roda `git diff --exit-code`: se alguém mudar a API e não regenerar o
  client, o pipeline falha. Front e back não conseguem mais sair dessincronizados, porque o deploy
  passa pelo mesmo commit e pelo mesmo pipeline.
- Ajustei a API para o `operationId` ser o nome da função da rota. Sem isso, o hook gerado se chamaria
  `useGetListasByUserMediaListasUserGetPost`. Com o ajuste, ele se chama `useGetListasByUser`.

## 2. Por que dividi as regras assim

Usei uma pergunta como critério: **em que momento o agente precisa dessa informação?** Ela gerou
duas formas de divisão.

**Por workspace** (`CLAUDE.md` dentro de cada pasta). O Claude Code carrega um `CLAUDE.md` de
subpasta quando trabalha em arquivos daquela pasta. Quem mexe no front recebe as regras do front e não
gasta contexto com detalhes de SQLAlchemy.
- `apps/api/CLAUDE.md`: camadas, como escrever rotas, tabela de status de erro e o "depois de mudar
  rota, regenere o client".
- `apps/web/CLAUDE.md`: telas, como buscar dados, mocks, feedback ao usuário e padrão visual.
- `packages/api-client/CLAUDE.md`: uma regra principal, "não edite, regenere".

**Por preocupação transversal** (`.claude/rules/*.md`, com `paths:` no cabeçalho). Alguns assuntos não
pertencem a um workspace só:
- `database.md`: só vale para a API, mas é um assunto diferente de "como escrever rota". A regra mais
  importante dele: não existe migração, só `create_all`. Coluna nova em tabela existente não é aplicada
  sozinha.
- `auth.md`: vale para os dois lados, porque a autenticação é simulada nas duas pontas.
- `integracoes-externas.md`: TMDB/AniList e o campo `media_type`. Foi onde mais vi bugs entre front e
  back.

No vídeo, os subarquivos são API, Dashboard, Database, Auth e Listeners. Adaptei à realidade do CineList.
Não existe processamento por eventos (listeners), mas existem duas APIs externas com formatos
diferentes que vazam até o front. Por isso, no lugar de "Listeners", criei "Integrações externas".

**O `CLAUDE.md` da raiz** é o mapa: o que é o projeto, quem é quem, comandos, onde estão as outras
regras e, principalmente, **a ordem de uma feature cross-stack** (banco → rota com schema →
`npm run generate` → front com hooks gerados → commit único).

Para decidir onde cada regra vai, usei três perguntas:
1. Se vale só dentro de um workspace, vai para o `CLAUDE.md` dele.
2. Se vale para mais de um workspace ou é um assunto com vida própria (banco, auth), vai para `.claude/rules/`.
3. Se o agente precisa saber antes de escolher onde mexer, vai para a raiz.

## 3. Padrões, não nomes de arquivo

Nas regras não aparece `media_router.py`, `Lists.jsx` nem `FIXED_USER_ID`. Elas descrevem o padrão:
"cada recurso tem seu router registrado com prefix e tag", "uma página por rota, dentro do wrapper de
rota privada", "o id de usuário fixo está espalhado, não espalhe mais". Escolhi assim porque:

- **Nome de arquivo envelhece rápido.** Se eu escrevo "as listas ficam no `media_router`" e amanhã
  alguém cria um `lista_router` (que é exatamente o que a regra pede para recursos novos), a regra passa
  a mentir. Uma regra desatualizada é pior que nenhuma, porque o agente confia nela.
- **O agente acha arquivos sozinho.** Ele tem busca. O que ele não consegue deduzir lendo o código é a
  intenção: o que é padrão, o que é gambiarra, o que não pode mudar.

Abri três exceções conscientes:
- **Nomes de workspace** (`apps/api`, `apps/web`, `packages/api-client`). Eles são a fronteira do
  monorepo e só mudam numa reorganização, que vai mexer nas regras de qualquer jeito.
- **Nomes do contrato** (`media_type`, `serie`, `nome`, `score`). São API pública e estão em produção.
  Mudar algum deles já exige mudar os dois lados, e a regra vai junto.
- **Comandos** (`npm run generate`). São a interface estável do monorepo.

Outra decisão que considero central: **registrar as dívidas conhecidas.** Se eu digo ao agente "use
Listas como referência", ele vai copiar também os defeitos de Listas: leitura via `POST .../get`,
`user_id` fixo, router de mídia inchado e rotas sem `response_model`. Por isso cada regra que diverge do
código atual diz isso explicitamente ("*Dívida conhecida:* ... não repita"). O agente segue Listas no
que ela tem de bom e não multiplica o que ela tem de ruim.

## 4. Como isso ajuda numa feature que mexe no back e no front

Exemplo: Favoritos (marcar mídia como favorita e ver numa aba do perfil).

- **Visão dos dois lados.** No mesmo repositório, o agente lê o modelo `Lista` e a tela de listas na
  mesma sessão. Antes, eram dois projetos abertos separadamente.
- **Ordem certa.** A raiz manda começar pela API e regenerar o contrato antes do front. Assim o front
  nunca é escrito em cima de um formato imaginado.
- **Tipagem atravessando a fronteira.** A regra da API exige `response_model` e `GET` para leitura.
  Com isso, o Kubb gera `useQuery` tipado para "listar favoritos" e `useMutation` para
  marcar/desmarcar. A regra do front manda usar esses hooks, então um campo renomeado na API vira
  erro no client gerado, e não um bug em produção.
- **Os bugs clássicos já avisados.** `integracoes-externas.md` lembra do `tv` → `serie` e dos campos
  diferentes de anime. `auth.md` impede uma 10ª página com id de usuário fixo (hoje são 9). `database.md` avisa que a tabela nova
  é criada sozinha, mas que alterar tabela existente não.
- **Teste do front sem a API.** As factories `create*` geradas permitem montar a aba de favoritos
  (vazia, com um item, com muitos) antes da rota existir de verdade.
- **Rede de segurança.** Se mesmo assim algo sair dessincronizado, o CI acusa.

## 5. Plan mode: planejando Favoritos com Listas como referência

Rodei o Claude Code em **plan mode** (`--permission-mode plan`, só leitura) na raiz do monorepo com este
prompt:

> Quero implementar a feature de Favoritos no CineList: o usuário marca/desmarca qualquer mídia (filme,
> série ou anime) como favorita na tela de detalhes da mídia, e vê todos os favoritos numa aba nova do
> Perfil. Use a feature de Listas como referência de padrão, tanto na API quanto no front. Planeje a
> implementação ponta a ponta — banco, rotas, contrato/client gerado e telas — seguindo o CLAUDE.md e as
> regras de cada contexto. Aponte onde Favoritos deve seguir Listas e onde deve divergir dela por causa
> das regras. Não implemente nada ainda, só o plano.

A transcrição completa está em [`docs/plan-mode/TRANSCRICAO.md`](docs/plan-mode/TRANSCRICAO.md). A sessão
bruta, com todas as chamadas de ferramenta, está em `docs/plan-mode/sessao.jsonl`.

**Evidência de que ele enxergou os dois lados**, na mesma sessão:
- **Regras:** leu todas (raiz, as três de workspace e as três transversais).
- **API:** leu os modelos de Lista e Usuário, os schemas de lista, as rotas `add_item` e `rate` e os
  serviços TMDB/AniList.
- **Front:** leu o contexto do usuário, as rotas, o serviço de listas, a página de Perfil, a página de
  detalhes da mídia e o `MediaCard`.
- **Contrato:** leu a config do Kubb, um client e um hook gerados, a lista de mocks e o CI.

**O que mostra que as regras funcionaram.** O plano tem uma tabela "segue Listas / diverge de Listas",
e cada divergência cita a regra que a motivou:
- **Router próprio `/favoritos`**, sem aumentar o router de mídia (`apps/api/CLAUDE.md`).
- **Leitura com `GET`**, para virar `useQuery`, em vez do `POST .../get` de Listas.
- **`response_model` em todas as rotas** e ordem de validação usuário → tipo → duplicidade → provedor.
  O agente notou sozinho que o `add_item` de Listas não confere se o usuário existe.
- **Sem migração manual:** "tabela nova, o `create_all` cria" (`database.md`).
- **Front:** usa hooks gerados (`useCreateFavorito`, `useListFavoritos`, `useDeleteFavorito`) em vez de
  um serviço axios novo.
- **Id do usuário:** lido do contexto do usuário, sem criar outro id fixo (`auth.md`).
- **Conversão `tv` → `serie`** e imagens relativas/absolutas tratadas (`integracoes-externas.md`).
- **Mocks** `createFavoritoOut()` para testar a tela sem a API.

Ele também levantou um ponto que eu não tinha previsto: o client gerado pelo Kubb usa uma instância axios
própria e **não envia o token nem trata 401** como o client manual do front. O agente sugeriu configurar
isso uma vez no front, sem editar o código gerado. Só um agente com os dois lados no contexto (o client
manual em `apps/web` e o gerado em `packages/`) perceberia essa diferença.

## O que ficou de fora (de propósito)

- **As telas antigas não foram migradas para os hooks gerados.** A regra diz "feature nova usa hooks,
  tela antiga mantém o padrão dela". Migrar tudo agora seria uma refatoração grande, misturada com a
  reorganização.
- **Lint do front**: já havia 28 problemas antes da migração (`catch (error)` sem uso). No CI ele roda
  como aviso (`continue-on-error`), e o comentário no workflow explica o porquê.
- **Auth real e migrações de banco** ficaram registradas como estado atual nas regras. Merecem tarefas
  próprias.
