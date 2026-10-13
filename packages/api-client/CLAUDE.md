# api-client: código gerado

Tudo em `src/gen` é gerado pelo Kubb a partir de `apps/api/openapi.json` e é **apagado e recriado** a
cada geração.

- **Nunca edite `src/gen` à mão.** A edição some na próxima geração e o CI acusa a diferença.
- Precisa de um campo, tipo ou endpoint diferente? Mude a API (rota/schema) e rode `npm run generate` na raiz.
- O que é gerado, por operação da API:
  - `types`: tipos de request/response
  - `clients`: função axios
  - `hooks`: `useQuery` para `GET`, `useMutation` para o resto
  - `mocks`: factory Faker `create*`
- Os nomes saem do nome da função da rota no FastAPI. Se um nome ficou ruim no front, renomeie a
  função na API.
- Só a configuração do gerador (`kubb.config.ts`) é editável aqui.
