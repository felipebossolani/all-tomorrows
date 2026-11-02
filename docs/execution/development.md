# Desenvolvimento e execução

Status: active
Owner: project maintainer
Updated: 2026-11-02

## Ambiente

Node.js 22.23.3 e npm 10.9.9 usados nesta implementação. Dependências exatas no
package-lock.json. Instalar com `npm ci`.

## Comandos

| Comando                | Resultado                                 |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento na porta 5173 |
| `npm run build`        | Typecheck e pacote estático em dist/      |
| `npm run preview`      | Servir o pacote de produção localmente    |
| `npm test`             | Regras, soluções e provas de necessidade  |
| `npm run test:e2e`     | Integração em Chromium e Firefox          |
| `npm run lint`         | Verificação estática                      |
| `npm run format:check` | Formatação                                |

Antes dos testes de navegador, executar `npx playwright install chromium firefox`.
Se faltarem bibliotecas Linux, instalar as dependências de sistema indicadas pelo
Playwright. Não é necessário backend, conta, chave de API ou Docker para jogar.

## Distribuição e direitos

Publicar somente dist/ em um host estático. Caminhos do Vite são relativos para
permitir hospedagem em subdiretórios. O progresso fica no navegador e não é enviado.
Os ícones geométricos da primeira versão jogável são provisórios. Referências e
conceitos derivados permanecem fora da distribuição pública até definição de direitos.
