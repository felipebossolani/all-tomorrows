# Corpo sob Medida — plano técnico

Data: 2026-11-02. Entrega desta etapa: arquitetura e divisão de trabalho.
Implementação autorizada; este documento antecede o código conforme o pedido mais recente.

## Resultado e limites

Seis salas, quatro módulos, montagem, puzzles, dicas e final; português brasileiro,
navegador desktop e execução estática. A primeira entrega jogável será uma sala
completa. A entrega ao filho será a campanha completa, depois da revisão visual de Felipe.
Sem backend, multiplayer, editor, telemetria ou expansão antes do playtest.

## Estado verificado no Linux

- Árvore Git limpa em main no início; HEAD 6087285 corresponde ao HEAD remoto.
- GitHub acessível por Git HTTPS; gh autenticado como felipebossolani.
- Node 22.23.3 e npm 10.9.9 disponíveis; npm ping passou.
- Nenhum executável chromium/firefox encontrado no PATH. Navegadores do Playwright ainda precisam ser provisionados e testados.
- Não há aplicação ou testes executados. A disponibilidade de workers Orca e seus modelos ainda precisa ser confirmada no despacho.
- O sandbox falhou antes dos comandos com `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`.
  As verificações funcionaram com execução escalada autorizada pelo ambiente; não é falha de DNS nem do GitHub.
- RTK.md, referenciado nas instruções globais, não existe na raiz. Não presumir instruções desse arquivo.
- Os impedimentos do Mac em tasks/todo.md são históricos.

## Stack escolhida

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Linguagem | TypeScript em modo strict | Contratos de estado e comandos explícitos |
| Build | Vite, npm e lockfile versionado | Aplicação estática com desenvolvimento e build simples |
| Apresentação | HTML/CSS e SVG inline | Sala pequena, grade discreta, seleção por mouse e composição visual sem engine |
| Regras | Funções TypeScript puras | Simulação determinística, replay e testes sem navegador |
| Testes de domínio | Vitest | Regras, soluções e estados inválidos |
| Testes de interface | Playwright, Chromium e Firefox | Fluxo completo, teclado, mouse e persistência |
| Qualidade | ESLint e Prettier | Verificação automática consistente |
| Persistência | localStorage versionado | Só fases liberadas e preferência de som |
| Áudio | Web Audio API | Sons opcionais sem biblioteca ou arquivos externos |

Não usar React, engine de física ou biblioteca de estado nesta v0. SVG permite
substituir as formas provisórias por imagens aprovadas sem alterar as regras.
Versões exatas serão selecionadas e verificadas na instalação, registradas no lockfile;
este plano não afirma compatibilidade de versões que ainda não foram instaladas.

Scripts a criar: `dev`, `build` (incluindo typecheck), `test`, `test:e2e`, `lint`,
`format:check` e `preview`. Instalação reproduzível com `npm ci` após criar o lockfile.
A distribuição será dist/, sem segredos ou requisições de dados do jogador.
Publicar commits no Git não equivale a configurar hospedagem; a URL jogável depende de uma etapa própria.

## Decisão de regras: extensor e grade

Problema: no PRD atual, pé, olho ou garra também podem conectar outra peça.
Assim, substituir um extensor por um módulo funcional mantém a geometria e adiciona
uma função. A grade 3×3 também impede uma cadeia reta núcleo–extensor–garra:
o segundo módulo estaria fora da grade. Não basta prometer que o layout resolve isso.

Decisão para prototipar: preservar 3×3 e quatro vagas; somente núcleo e extensores
servem de suporte para outros módulos. Pé, olho e garra são terminais.
Formalmente, cada módulo funcional deve ter um vizinho ortogonal que seja núcleo ou
extensor; cada extensor deve estar conectado ao núcleo por uma cadeia de extensores.
Contatos laterais extras são permitidos e não tornam uma peça funcional um suporte.

Exemplo válido: núcleo (0,0), extensor (1,0), garra (1,1), pé (0,-1).
Sem extensor, a garra diagonal fica sem suporte. O alcance adicional ocorre na esquina,
não numa linha reta. A sala 4 será um acesso em cotovelo que explora essa geometria.
Isso corrige a utilidade do extensor sem ampliar a grade ou criar alcance invisível.

A decisão ainda exige validação de layout: enumerar montagens legais e estados
alcançáveis da sala 4, com e sem extensor. Deve existir solução com ele e nenhuma
sem ele. Uma solução gravada prova possibilidade, mas não necessidade.
Se a busca encontrar uma alternativa, corrigir o layout antes de aprovar a sala.
Sincronizar o PRD com esta regra no primeiro commit de implementação.

Semente e berço serão elementos de piso transitáveis; paredes e portas fechadas
bloqueiam ocupação. Interagir exige alvo em célula ortogonal adjacente à garra.
Desfazer permanece disponível na tela de conclusão antes de avançar; histórico é
restrito à fase atual. Reiniciar também funciona durante edição ou seleção de alvo.

## Arquitetura e contratos

- src/domain/: tipos, validação de montagem, colisão, comandos e transições.
- src/levels/: seis descrições, estoques, duas dicas e soluções executáveis.
- src/ui/: renderização SVG, editor de montagem, controles e mensagens.
- src/platform/: armazenamento tolerante a falhas e áudio.
- tests/: domínio, regressão das soluções e integração no navegador.
- assets/: apenas recursos com procedência e publicação documentadas.

GameState contém fase, posição do núcleo, montagem confirmada, semente, portas e
conclusão. Comandos tipados incluem mover, interagir com alvo explícito e confirmar
montagem. A transição retorna novo estado ou motivo de rejeição em português.
Montagem em edição fica fora do estado confirmado até validação atômica.
Só ações válidas alteram o histórico; snapshots completos são suficientes neste escopo.
Desfazer restaura estoque, módulos, portas e semente juntos. Reiniciar reconstrói o
estado inicial da fase, sem depender de um histórico possivelmente alterado.

A UI consulta os alvos elegíveis. Espaço com vários alvos abre seleção explícita;
setas escolhem e espaço confirma, sem mover o corpo nesse modo. Mouse pode escolher.
Comandos de exploração não disparam durante edição ou foco em controles.
Dados persistidos são validados; JSON inválido, versão desconhecida ou falha de escrita
não impedem jogar. Não salvar estado intermediário da sala nesta versão.

## Divisão de trabalho — 100% Codex

Eu permaneço responsável pela arquitetura, decisões de produto, contratos, integração
e aceite. Também orquestro: criar outro agente só para repassar mensagens aumentaria
o custo sem remover trabalho. Orca será o mecanismo de supervisão, não outro cérebro.
Todos os executores serão lançados com agent codex; nenhum worker Claude.

| Responsável | Escopo e arquivos | Entrega observável |
| --- | --- | --- |
| Coordenador, esta sessão Codex | Contratos, configuração, documentação, integração e Git | Build integrado e critérios de aceite comprovados |
| Executor A, Codex | src/domain/, src/levels/ e testes correspondentes | Primeira sala reproduzível, depois seis soluções e provas das restrições |
| Executor B, Codex | src/ui/, src/platform/ e testes de interface | Montar/jogar/desfazer/reiniciar pelo navegador; depois apresentação e progresso |
| Revisor Codex, em etapa posterior | Leitura independente, sem editar | Achados reproduzíveis sobre regras, soluções e integração |

Começar com no máximo dois workers. A e B trabalham em paralelo somente depois de
fechar os contratos; mudanças nesses contratos voltam ao coordenador. Cada tarefa
terá arquivos exclusivos, dependências, restrições e comando de aceite. Correções
voltam ao autor. Integrar resultados aprovados, sem commits concorrentes na mesma árvore.
Usar worktrees Orca isoladas se o runtime estiver disponível; confirmar configuração
efetiva de cada lançamento antes de considerar um worker operacional.

A skill poteto-orchestrate indica gpt-5.6-terra/high para implementação delimitada,
gpt-5.6-sol/medium para ambiguidades e gpt-6-astra/low para revisão independente.
Esses IDs são política local, não disponibilidade comprovada. Não prometer um modelo
sem recibo de execução. Se indisponível, registrar a exceção e manter trabalho nesta
sessão Codex até configurar um executor suportado; não migrar para outro fornecedor.
Nesta etapa documental não foram lançados workers.

## Ordem de execução e critérios de passagem

1. Instalar stack, fixar contratos e implementar regras com formas provisórias.
2. Entregar sala 1 completa: montagem, movimento, interação, entrega, desfazer e reinício.
   Passar testes de domínio e fluxo real no navegador antes de expandir a campanha.
3. Construir salas 2–6. Reproduzir cada solução; demonstrar necessidade de extensor
   na 4 e de reconfiguração na 5 por exploração dos estados legais.
4. Paralelamente, examinar referências visuais reais e registrar origem/autoria.
   Produzir uma única amostra em contexto de jogo e solicitar aprovação de Felipe.
5. Completar dicas, progresso, instruções, som opcional e encerramento. Integrar
   imagens finais apenas após aprovação visual e definição das condições de publicação.
6. Rodar lint, typecheck, build, testes de regras, soluções e integração. Inspecionar
   Chromium e Firefox em 1280×720, incluindo foco, legibilidade e recuperação de erros.
7. Fazer commits atômicos Conventional Commits em inglês e push por Git; confirmar
   SHA remoto. Entregar instruções reais e limitações, sem afirmar playtest infantil concluído.

## Validação que pode reprovar a entrega

Testar conectividade, suporte terminal, estoque, limite de vagas, ausência de pé,
colisão em todas as células, portas, olho, interação ambígua e remoção da última garra
carregando. Rejeições não podem alterar o estado ou consumir desfazer.

Cada sala terá uma sequência de comandos reproduzível. Para a sala 5, executar busca
sem permitir reconfiguração após a saída inicial e exigir ausência de solução; com
reconfiguração, demonstrar chegada à segunda estação e conclusão. A busca deve usar
os mesmos comandos e regras do jogo, com estados canônicos e conjunto de visitados.

No navegador: resolver campanha, desfazer montagem/interação, reiniciar, recarregar
progresso, simular armazenamento indisponível e alcançar o final. Inspecionar arte em
contexto separadamente: testes automatizados não demonstram fidelidade ao livro.

## Arte e direitos

O coordenador conduz a pesquisa e a revisão visual. Antes de produzir imagens,
examinar referências reais dos Modular People; registrar silhueta, anatomia e
proporções observadas. Não usar descrição textual como substituto dessa inspeção.
A amostra será revisada por Felipe, sem envolver o filho. Até lá, formas provisórias.

100% Codex se refere à coordenação e programação. Se a produção de bitmap exigir
uma ferramenta de geração de imagens, declarar seu uso; não alegar que um modelo
Codex gerou os pixels. Código de desenho/SVG pode ser produzido diretamente por Codex.

Não copiar scans para o repositório. Aprovação estética não concede licença.
Assets derivados sem condições de distribuição definidas ficam fora do push público;
o código e os placeholders podem avançar. RIGHTS.md continua sendo a referência.

## Review desta etapa

Documentos exigidos e lições lidos; estado remoto e registro npm acessíveis.
Nenhum teste de jogo, inspeção visual de referências ou prova de layout foi executado
nesta etapa documental. A necessidade do extensor foi identificada como risco concreto,
e não declarada resolvida antes da implementação e da busca.
