# Front-end web (React): padrões

SPA em React 19 com **JavaScript (JSX)**, Vite, Tailwind CSS 4, React Router 7 e ícones `lucide-react`.
Não introduza TypeScript nos arquivos do app. Os tipos chegam prontos do client gerado.

## Telas e rotas

- Uma página por rota, todas registradas no componente raiz de rotas. As páginas que exigem login ficam
  dentro do wrapper de rota privada, e login/cadastro ficam no wrapper de rota pública.
- Componentes reutilizáveis (cards de mídia, modais, spinner, mensagem) ficam separados das páginas.
  Antes de criar um componente, procure um equivalente: cards, modal de "adicionar à lista" e o
  spinner de carregamento já existem.
- Estado global só para o usuário logado (Context API). O resto é estado local da página.
  Não adicione Redux/Zustand.

## Dados (como falar com a API)

- **Feature nova usa os hooks gerados** de `@cinelist/api-client/hooks` (React Query) e os tipos de
  `@cinelist/api-client/types`. Não escreva chamadas axios novas à mão. Se o hook que você precisa não
  existe, o endpoint ainda não existe na API ou o client não foi regenerado (`npm run generate`).
- **Legado:** as telas atuais usam uma camada de serviços com axios (uma função por endpoint, com
  `try/catch` que loga e relança). Ao mexer numa tela antiga, mantenha o padrão dela. Migre para o hook
  gerado só se essa for a tarefa.
- Depois de uma mutation que altera dados que outra tela mostra, invalide as queries afetadas em vez
  de recarregar a página na mão.
- Use os nomes de campo exatamente como a API devolve (`nome`, `media_type`, `item_count`...).

## Desenvolver sem a API rodando

As factories `create<Schema>()` de `@cinelist/api-client/mocks` (Faker, seed fixa) geram objetos no
formato exato do contrato, por exemplo `createListaWithItens({ nome: 'Favoritos' })`. Use-as para montar
estados da tela (vazio, um item, muitos itens), protótipos e testes. Elas não substituem o teste final
contra a API real.

## Feedback e carregamento

- Toda ação do usuário dá retorno visual com o hook de mensagem + componente de mensagem (sucesso/erro),
  com texto em português. Em erro de API, mostre o `detail` que a API devolveu quando ele existir.
- Enquanto carrega, mostre o spinner compartilhado com um texto do tipo "Carregando suas listas...".
- Lista vazia sempre tem estado vazio com ícone, título, explicação e botão de ação.

## Visual

- Tailwind utilitário direto no JSX. Sem CSS novo por componente.
- Paleta: `slate` para texto e fundos, `blue-600/700` para ação primária, `red-600` para ação destrutiva.
- Cabeçalho de página: faixa com gradiente escuro, ícone + título centralizados e subtítulo.
- Cards `bg-white rounded-xl shadow-md hover:shadow-lg`. Modais `fixed inset-0 bg-black/50` com caixa
  `rounded-2xl`, fechando ao clicar fora.
- Conteúdo limitado em largura (`max-w-[1600px] mx-auto`) e grid responsivo de 1 → 2 → 3+ colunas.
- Imagem de mídia: o caminho pode ser relativo (TMDB) ou URL absoluta (AniList) e precisa ser
  resolvido antes de virar `src` (ver `.claude/rules/integracoes-externas.md`). *Dívida conhecida:*
  essa função está copiada em vários componentes. Se precisar dela num lugar novo, extraia para um
  utilitário compartilhado em vez de copiar de novo.
