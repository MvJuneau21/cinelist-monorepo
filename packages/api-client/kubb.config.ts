import { defineConfig } from 'kubb/config'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginAxios } from '@kubb/plugin-axios'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginFaker } from '@kubb/plugin-faker'

// Fonte da verdade: o OpenAPI exportado pela API (`npm run openapi` na raiz).
// Tudo em src/gen é descartável e regenerado — nunca editar à mão.
export default defineConfig({
  input: '../../apps/api/openapi.json',
  output: { path: './src/gen', clean: true },
  plugins: [
    pluginTs(),
    pluginAxios({ baseURL: 'http://localhost:8000' }),
    pluginReactQuery({ hooks: true }),
    pluginFaker({ seed: [42] }),
  ],
})
