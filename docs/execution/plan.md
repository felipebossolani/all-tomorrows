# Plano de execução — Linux

Status: active
Owner: project maintainer
Updated: 2026-11-02

## Histórico

A preparação documental no Mac foi concluída. Os bloqueios de DNS e de criação de
.git daquela sessão não descrevem o ambiente atual. Em 2026-11-02, main e HEAD
remoto apontavam para 6087285; acesso GitHub e npm verificado no Linux.

## Plano

- [x] Ler documentos obrigatórios e lições.
- [x] Conferir Git/GitHub e ferramentas Linux.
- [x] Registrar stack, divisão Codex e correção proposta das regras em docs/architecture/technical-design.md.
- [x] Provisionar toolchain e navegadores; confirmar runtime/modelos dos workers.
- [x] Sincronizar PRD e implementar domínio com regra de suporte dos extensores.
- [x] Entregar e testar a primeira sala completa com placeholders.
- [x] Examinar referências visuais reais e preparar amostra em contexto.
- [ ] Definir direitos dos assets finais; Felipe transferiu a avaliação visual para o conjunto ao final.
- [x] Implementar seis salas e registrar soluções executáveis.
- [x] Provar necessidade de extensor na sala 4 e reconfiguração na sala 5.
- [x] Completar dicas, progresso local, som, apresentação e final.
- [ ] Integrar arte aprovada com procedência documentada.
- [x] Executar checks e validar Chromium e Firefox em 1280×720.
- [ ] Publicar implementação em commits pequenos por Git e confirmar SHA remoto.

## Review

Aplicação implementada com seis salas e formas provisórias. Grade 3×3 preservada;
módulos funcionais terminais e extensão em cotovelo validados por busca exaustiva.
18 testes de domínio e 12 testes de navegador passaram (Chromium e Firefox).
Falha atual do sandbox bwrap contornada por execução escalada; sem bloqueio GitHub.

## Padronização documental

- [x] Organizar documentos por produto, arquitetura, execução, direitos e histórico.
- [x] Adotar nomes English kebab-case e índice canônico.
- [x] Atualizar AGENTS.md, links e lição sobre nomenclatura.
- [x] Validar links locais: nove documentos, nenhum link quebrado; git diff --check passou.

## Entrega jogável v0.1.0

- Campanha completa, montagem 3×3, quatro módulos, dicas, áudio opcional, desfazer, reiniciar e progresso local implementados.
- Build, lint, Prettier, 18 testes de domínio e 12 testes de navegador passaram.
- Busca exaustiva confirmou extensor na sala 4 e remontagem na sala 5; soluções completas executadas em Chromium e Firefox.
- Revisão independente corrigiu movimento com foco em controles e foco ao revisitar o jardim final; regressões passaram.
- Dois executores e um revisor Codex via Orca encerrados; nenhum worker pendente. IDs de modelo/esforço não foram informados pelo runtime.
- Referência visual examinada e conceito em contexto gerado fora do Git. Assets finais dos personagens não publicados: condições de distribuição ainda indefinidas.
- Auditoria npm: zero vulnerabilidades de produção; 11 avisos moderados transitivos na toolchain de lint (minimatch). Não foi aplicado downgrade destrutivo sugerido pelo audit.
- Testes automatizados não validam duração de 15–25 minutos nem diversão; playtest infantil permanece posterior à avaliação de Felipe.
