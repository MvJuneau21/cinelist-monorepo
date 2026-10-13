# CineList

O CineList é uma aplicação web para organizar e avaliar mídias como filmes, séries e animes.
O usuário pode pesquisar, filtrar, adicionar à sua lista pessoal e registrar avaliações com notas e comentários.

---

## Funcionalidades

* Autenticação simples (login e cadastro mockados).
* Pesquisa e filtroa por filmes, séries e animes.
* Visualização de detalhes das mídias com elenco, diretor/criador e notas.
* Avaliações personalizadas com comentários e notas de 0 a 10.
* Lista pessoal de mídias adicionadas pelo usuário.
* Perfil do usuário exibindo avatar, lista e avaliações.
* Mensagens de feedback (sucesso, erro e aviso) exibidas de forma elegante.

---

## Decisões Arquiteturais

### Modelo Arquitetural

* O projeto segue a abordagem **SPA**, garantindo navegação rápida sem recarregamento completo da página.
* As rotas são gerenciadas com **React Router DOM**.

### Gerenciamento de Estado

* Implementado com Context API (UserContext), suficiente para a complexidade atual do projeto.
* Evitamos Redux para manter simplicidade, já que os estados são de escopo limitado (usuário logado e listas).

### Mock de Dados

* Utilização de arrays locais simulando mídias e usuários.
* Essa decisão foi tomada para validar as features antes de integrar com uma API real (ex.: TMDB, AniList).

### Estilização

* Escolha do Tailwind CSS pela rapidez no protótipo e flexibilidade.
* Padronização de feedbacks visuais com toast notifications. (futuramente)

### Organização de Pastas

* Separação em components, `pages`, `layout` e `context`, visando modularidade e reutilização.
* Uso de layouts distintos para páginas públicas (ex.: Login, Registro) e privadas (ex.: Perfil, Listas).

### Estrutura de Pastas

```
src/
├── App.jsx               # Configuração das rotas
├── main.jsx              # Ponto de entrada da aplicação
├── assets/               # Possíveis assets, logo, ui de forma geral, etc.
├── components/           # Navbar, Footer, etc.
├── context/              # UserContext para estado global
├── layout/               # Layouts público e privado
├── pages/                # Páginas (Home, Login, Register, MediaDetails, Profile)
└── index.css             # Estilos globais
```

---

## Tecnologias utilizadas

* Frontend: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* Estilização: [Tailwind CSS](https://tailwindcss.com)
* Roteamento: [React Router DOM](https://reactrouter.com/)
* Gerenciamento de estado local: Context API (UserContext)
* Mock de dados: Arrays locais simulando mídias e usuários

---

## Como Rodar o Projeto

1. Clone o repositório:

```bash
git clone "https://github.com/S204-Inatel-2025-2/cinelist-frontend"
```

2. Navegue até o diretório:

```bash
cd cinelist-frontend
```

3. Instale as dependências:

```bash
npm install
```

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
```
> Por padrão será iniciado em http://localhost:5173

---

## Próximos Passos

* Integração com o **backend**.
* Implementação de **sistema real de autenticação**.
* Melhorias na UI/UX.
* Deploy

---

## Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE).