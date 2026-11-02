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
- [x] Publicar implementação em commits pequenos por Git e confirmar SHA remoto (5b038ab na primeira publicação da v0.1.0).

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

## Redesenho após playtest — v0.2

- [x] Fechar contratos de missões, formas prontas e introdução progressiva.
- [x] Recriar regras da primeira sala: corpo inicial funcional, estação após movimento e primeira mudança simples.
- [x] Transformar as seis salas em situações de cooperação, com objetivos e recompensas distintos no contrato de fases.
- [x] Implementar teclado completo e mouse completo, sem alternância obrigatória.
- [x] Dar vida ao corpo, companheiros e ambiente preservando a paleta aprovada.
- [x] Validar aprendizagem observável, soluções, recuperação e ambos os modos de entrada nos dois navegadores.
- [x] Revisar e disponibilizar a build final de produção em :4173; publicação por Git registrada na entrega.

### Contrato de produto

Manter seis salas, quatro módulos e regras determinísticas. A montagem livre será
opcional nas primeiras salas; formas prontas com prévia e propósito são o caminho
principal. Começar com corpo que anda. Ensinar pela necessidade no cenário antes
de pedir uma configuração. Objetivos de cooperação podem concluir por entrega,
ativação ou chegada; não apresentar seis entregas idênticas com nomes diferentes.
Sem combate, cronômetro, novas dependências ou expansão de campanha. Narrativa
original inspirada nos Modular People, sem alegar episódios canônicos.

### Divisão

Executor A: tipos, domínio, fases, presets e testes de domínio. Executor B: UI,
controles, onboarding e feedback. Coordenador: contratos, integração, testes de
navegador, documentação e publicação. Arte será integrada após estabilizar os
contratos da UI, respeitando direitos e sem copiar ilustrações.

### Checkpoint de integração v0.2

Domínio aprovado: 21 testes, soluções baseadas em presets e provas das salas 4/5.
Primeira entrega de UI rejeitada na integração: formulários sempre visíveis,
seletor de fases ausente, Enter interceptando botões e overflow em 1280×720.
Correções atribuídas ao mesmo executor; publicação depende de aceitação completa.
Modelos iniciais confirmados pelo Orca: gpt-5.6-terra/high em ambos os executores.

### Review v0.2

- Domínio: seis missões cooperativas, três tipos de objetivo, corpo inicial móvel, presets para todas as soluções; 21 testes aprovados.
- UI: modos explícitos de exploração/formas/editor, prévias espaciais, companheiros, efeitos por objetivo, seletor restaurado e movimento reduzido.
- Integração corrigiu cancelamento/reinício por mouse nos modos de edição e desfazer conclusão sem interceptar Enter de botões.
- Progresso v1 migra para schema v2 validado; dados inválidos e armazenamento indisponível não impedem jogar.
- Dois executores Codex gpt-5.6-terra/high confirmados pelo Orca. UI exigiu segundo despacho de correção; revisão e integração final ficaram com o coordenador.
- Arte continua original estilizada em código, não reprodução final licenciada dos personagens. Nenhuma imagem do livro foi publicada.
- Não afirmar diversão ou dificuldade infantil resolvida antes do novo playtest de Felipe.

Validação final local da v0.2: build, lint, Prettier, 21 testes de domínio e 22
testes Chromium/Firefox aprovados. Build de produção inspecionada em :4173,
sem erros de página e painel de formas com altura total de 720 px.

## Conceito inicial canônico — amostra para avaliação

- [x] Limitar pesquisa aos Worms, com Star People e Qu como contexto.
- [x] Examinar ilustração original e registrar limites da adaptação.
- [x] Documentar proposta curta e critérios de avaliação.
- [x] Criar cena isolada com movimento contínuo, escavação e controles completos.
- [x] Validar build, testes e navegador; disponibilizar amostra sem substituir campanha.
- [ ] Receber avaliação de Felipe antes de expandir espécies ou campanha.

### Review da amostra inicial

- Cena isolada `/concept.html`: movimento contínuo, escavação, colisão, três alimentos e abrigo, conclusão e reinício. Teclado e mouse independentes.
- Referência original de Worms examinada; conceito e separação entre cânone e adaptação em [opening-concept.md](../product/opening-concept.md).
- Build, lint, formatação, 21 testes de domínio e 28 testes de navegador aprovados, incluindo seis novos casos Chromium/Firefox.
- Build de produção inspecionada em 1280×720: controles visíveis, altura total de 720 px, nenhum erro de página. Captura local em `/tmp/opening-concept-final.png`.
- Campanha v0.2 preservada. Sem novas dependências de aplicação, persistência ou espécies adicionais. Formas continuam provisórias; arte final fiel e avaliação de diversão permanecem pendentes.
- Implementação desta amostra feita pelo coordenador Codex; nenhum worker lançado neste recorte delimitado.
