# Corpo sob Medida — PRD da v0

Status: active
Owner: project maintainer
Updated: 2026-11-02

Implementação: primeira versão jogável com seis salas; veja o plano de execução para validação e pendências visuais.
Data: 2026-11-02.
Repositório: https://github.com/felipebossolani/all-tomorrows
Responsável: Felipe Bossolani.

## Atualização após o primeiro playtest — v0.2

Esta seção substitui as descrições antigas de onboarding e campanha abaixo onde
houver conflito. O desenho completo da revisão está em
[Cooperação e descoberta](../architecture/cooperative-redesign.md).

- Começar com corpo montado e móvel; a primeira ação não exige editar uma grade.
- Apresentar a necessidade da transformação no cenário antes de pedir montagem.
- Oferecer formas prontas com prévia e função explícita; montagem livre é opcional.
- Seis situações originais de cooperação, incluindo entrega, ativação e chegada.
- Companheiros, reações e desfechos distintos dão consequência às ações.
- Teclado sozinho e mouse sozinho devem resolver toda a campanha, sem alternância.
- Preservar paleta e layout aprovados; acrescentar movimento com propósito e
  respeitar movimento reduzido. Animação nunca bloqueia a lógica.
- Manter seis salas, quatro módulos e ausência de combate, cronômetro e backend.
- A avaliação visual é do conjunto ao final. Direitos dos personagens permanecem
  separados; não confundir arte original abstrata com reprodução canônica.

## 1. Objetivo e hipótese

Criar um pequeno puzzle 2D sobre montar e reorganizar uma criatura modular para
resolver obstáculos. A v0 será preparada como surpresa: o primeiro jogador recebe
uma experiência completa, joga e valida a diversão antes de participar da criação.

Hipótese: mudar o próprio corpo para resolver uma sala gera descoberta,
identificação com All Tomorrows e vontade de inventar novas peças e fases.

A surpresa não depende de desenhos ou decisões prévias do jogador.
A participação criativa dele começa depois do primeiro playtest.

## 2. Experiência pretendida

- Uma campanha de seis salas feitas à mão, com começo, progressão e encerramento.
- Uma sessão inicial de aproximadamente 15–25 minutos; duração é hipótese a validar.
- Interface e textos em português brasileiro, com instruções de uma frase.
- Ritmo tranquilo: sem cronômetro, inimigos, mortes, sustos ou punição por experimentar.
- Arte fiel às referências do livro, sem intensificar o grotesco.
- Entendimento por observação e experimentação, sem precisar conhecer a história.
- Plataforma inicial: navegador desktop com teclado e mouse; desenvolvimento no Linux.

Idade e familiaridade do jogador com puzzles ainda não foram informadas. A v0
deve ensinar pelas primeiras salas e permitir ajuda opcional, sem pressupor idade.

## 3. Referência e direção visual obrigatória

A referência central são os Modular People de All Tomorrows, de C. M. Kösemen.
A mecânica é uma adaptação lúdica; suas regras não são apresentadas como fatos do livro.

**Pedido explícito de Felipe:** imagens fiéis ao livro; não quer algo grotesco.
Interpretar como fidelidade de silhueta, anatomia, proporções, organização dos
módulos e linguagem de ilustração, sem adicionar deformações ou horror.

- Usar imagens do livro como referência visual identificada, não apenas descrições.
- Preservar as características que tornam a criatura reconhecível.
- Priorizar cenas neutras de movimento, montagem, exploração e cooperação.
- Excluir gore, sangue, órgãos expostos, sofrimento, tortura e sexualização.
- Não substituir a direção por mascotes genéricos, estética chibi ou monstros aleatórios.
- Cores e acabamento devem ser derivados das referências selecionadas; não inventar
  uma paleta supostamente canônica antes de examinar as imagens.
- Interfaces e ícones podem ser simples e legíveis, sem alterar a anatomia da criatura.
- A grade é uma abstração das regras; a arte deve parecer um organismo contínuo,
  não obrigatoriamente um conjunto de blocos quadrados.

Antes de produzir o conjunto de imagens, selecionar referências dos Modular People
e preparar uma única amostra em contexto de jogo para revisão de Felipe.
Atualização de Felipe em 2026-11-02: avaliar o conjunto ao final; a revisão intermediária não bloqueia o trabalho. Isso não altera as condições de publicação de assets.
A falta de aprovação visual impede finalizar a arte, mas não impede desenvolver as
regras com formas provisórias na máquina Linux.

Não copiar scans, páginas ou ilustrações para este repositório público.
Registrar autoria, origem e condições de uso de cada futuro asset conforme
[Direitos e referências](../legal/rights-and-references.md). Fidelidade visual não implica licença de uso.

## 4. Loop principal

1. Observar a sala e o objetivo: levar uma semente ao berço de germinação.
2. Montar o corpo com as peças disponíveis para aquela fase.
3. Mover a criatura, acionar mecanismos e transportar a semente.
4. Desfazer ações ou voltar a uma estação para reorganizar o corpo.
5. Entregar a semente, ver uma breve germinação e avançar.

Recompensa principal: entender a solução e ver a criatura funcionar.
Sem pontuação, moedas, árvore de habilidades ou progressão artificial.

## 5. Regras propostas para a primeira implementação

### Mundo e movimento

- Visão superior, grade discreta; sala inteira visível sem rolagem.
- Movimento ortogonal de uma célula por comando, sem diagonais ou física contínua.
- O corpo ocupa o núcleo e todas as células dos módulos conectados.
- Um movimento é válido apenas se todas as células de destino estiverem livres.
- Sem gravidade, saltos, plataformas verticais ou rotação do corpo durante a exploração.
- A orientação é ajustada reorganizando peças na estação de montagem.
- Portas fechadas são obstáculos. Cada interruptor abre permanentemente sua porta
  na tentativa atual; reiniciar a fase restaura o estado inicial.
- Cada sala tem uma semente e um berço. Não há inventário de objetos adicionais.

### Corpo e montagem

- Um núcleo fixo e uma área de montagem de 3 × 3 células centrada nele.
- No máximo quatro módulos adicionais no corpo, além do núcleo.
- Peças conectadas por lados; conexão apenas diagonal é inválida.
- Somente núcleo e extensores suportam outros módulos. Pé, garra e olho são terminais: precisam tocar o núcleo ou um extensor conectado ao núcleo. Extensores podem formar cadeias entre si. Contatos adicionais entre módulos funcionais são permitidos, mas não servem de suporte.
- A fase oferece um estoque limitado e explícito de peças, que pode ter repetições.
- Montagem inicial e mudanças somente em estações sinalizadas no mapa.
- O núcleo deve estar sobre a estação para entrar no modo de montagem.
- Peças removidas voltam ao estoque da fase; não ficam no chão.
- Uma montagem precisa de ao menos um pé para sair da estação.
- A montagem é confirmada atomicamente; não pode ocupar paredes ou células bloqueadas.
- Se a criatura estiver carregando a semente, não pode remover a última garra.
- Não há separação em duas criaturas controláveis na v0.

### Quatro tipos de módulo

| Módulo   | Função                                                                              | Limite e custo                                                       |
| -------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Pé       | Permite mover o corpo inteiro.                                                      | Ocupa uma célula; pés extras não aumentam velocidade.                |
| Garra    | Pega e entrega a semente em célula ortogonalmente adjacente à garra.                | Só uma semente por corpo; o objeto carregado não ocupa célula extra. |
| Olho     | Revela o símbolo dos interruptores ocultos da sala enquanto equipado.               | O mecanismo oculto não pode ser acionado sem olho.                   |
| Extensor | Acrescenta uma célula de conexão para posicionar outro módulo mais longe do núcleo. | Não age sozinho; consome espaço e uma das quatro vagas.              |

A garra também aciona interruptores adjacentes. Não há alcance através de paredes.
Ao carregar a semente, continua podendo acionar mecanismos; a função não é bloqueada
por um objeto em mãos. O extensor aumenta alcance pela geometria do corpo, sem raio
de ação invisível. As portas abertas permanecem abertas ao retirar o olho.

O olho não esconde paredes ou caminhos: a navegação permanece legível.
Mecanismos ocultos têm uma marca visível de “precisa de olho”, evitando adivinhação.

### Recuperação e ajuda

- Desfazer restaura movimentos, interações e montagens confirmadas na fase atual.
- Reiniciar restaura mapa, corpo inicial, estoque, semente e portas da sala.
- Ação inválida não altera o estado e mostra uma indicação curta do motivo.
- Cada fase tem duas dicas graduais, acionadas pelo jogador.
- Sem limite de tentativas e sem necessidade de reflexos rápidos.

## 6. Campanha inicial

Os layouts exatos serão construídos e validados no Linux. Esta tabela define a
intenção de cada sala, não afirma que já existe solução verificada.

| Sala                           | Aprendizado                          | Desafio e restrição de design                                                                                       |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1. Primeiros passos            | Movimento, pegar e entregar.         | Pé e garra; caminho aberto, instruções contextuais e vitória rápida.                                                |
| 2. Cabe ou não cabe?           | Forma do corpo afeta colisão.        | Passagem estreita exige reorganizar pé e garra numa linha; sem novo módulo.                                         |
| 3. O que o olho vê             | Observar e abrir portas.             | Introduz olho; interruptor identificado e acionado pela garra libera a semente.                                     |
| 4. Um pouco mais longe         | Posicionar a garra com extensor.     | Acesso em cotovelo exige garra diagonal apoiada por extensor; busca exaustiva comprova ausência de solução sem ele. |
| 5. Mudar no caminho            | Reconfigurar após abrir um percurso. | Duas estações; abrir porta com olho e depois reorganizar para atravessar passagem estreita.                         |
| 6. Um corpo para cada problema | Combinar conhecimentos.              | Usar quatro módulos, abrir passagem, reconfigurar e entregar semente; nenhuma regra nova.                           |

Cada fase deve ter uma sequência de solução registrada e reproduzível.
A sala 4 precisa comprovar que exige extensor, e não apenas aproximar o corpo.
A sala 5 precisa comprovar que a reconfiguração é necessária e que a segunda estação
é alcançável. Se isso falhar, ajustar o layout antes de adicionar outra regra.

Final: germinação das sementes e convite “Que peça você inventaria agora?”.
O convite é uma conversa fora do jogo; sem formulário ou envio de dados.

## 7. Interface, entrada e apresentação

- Tela inicial com Jogar, Continuar (quando disponível) e Som ligado/desligado.
- Setas ou WASD para mover; espaço para interagir; Z para desfazer; R para reiniciar.
- Se houver vários alvos adjacentes, destacar os elegíveis e permitir escolher por
  direção antes de confirmar; nunca escolher silenciosamente um alvo ambíguo.
- Mouse para selecionar peça e clicar no encaixe; arrastar não é obrigatório.
- Botões visíveis para ações principais e ajuda; instrução contextual na estação.
- Distinguir módulos por forma e ícone, além de cor.
- Texto legível em 1280 × 720, com foco e estados de seleção claros.
- Animações curtas; a lógica não depende da animação terminar.
- Sons suaves opcionais; o jogo deve ser plenamente compreensível sem áudio.
- Salvar localmente fases liberadas e preferência de som; sem conta ou servidor.
- Se o armazenamento estiver indisponível, continuar a sessão sem falhar.

## 8. Escopo e exclusões

Incluído: seis fases, quatro módulos, montagem em estações, desfazer, reiniciar,
duas dicas por fase, progressão local, instruções, final e arte revisada.

Fora da v0: multiplayer, controle simultâneo de fragmentos, simulação evolutiva,
geração procedural, editor público de fases, combate, campanha sobre a história
completa, integração com IA durante o jogo, login, analytics, monetização,
aplicativos nativos e suporte obrigatório a celular/controle.

O foco é uma experiência fechada. Novas espécies ou mecânicas só entram depois
do playtest; ideias alternativas estão em [docs/product/ideas.md](ideas.md).

## 9. Direção técnica para retomada no Linux

Proposta inicial: aplicação estática de navegador, TypeScript e renderização 2D
simples. Escolher ferramenta de build e renderizador no início da implementação,
com dependências mínimas e justificadas. Nenhum framework está instalado.

Separar regras determinísticas de montagem, colisão e interação da apresentação.
Definir fases como dados, incluindo estoque inicial, mapa, mecanismos, dicas e
solução de referência. Isso permite criar novas salas sem mudar o motor.

Estrutura prevista: src/ para aplicação, tests/ para testes e assets/ para recursos.
Usar testes focados em comportamento, commits Conventional Commits em inglês e
composição em vez de herança.
Não adicionar backend, banco de dados ou Docker à v0 sem uma necessidade concreta.

Comandos de instalação, desenvolvimento, build e testes serão definidos com a
toolchain no Linux e documentados naquele momento. Não há comandos de jogo válidos hoje.

## 10. Critérios de aceite da v0

- É possível iniciar, resolver as seis salas e alcançar o final numa sessão limpa.
- Cada solução de referência é executável; nenhuma sala depende de uma regra oculta.
- Nenhuma montagem permite peças desconectadas, sobrepostas ou dentro de paredes.
- Movimentos consideram todas as células ocupadas, inclusive extremidades.
- Interações ambíguas exigem seleção explícita.
- Desfazer restaura também semente, portas, módulos e estoque.
- Reiniciar recupera qualquer estado sem recarregar a página.
- Não é possível perder definitivamente a semente ou ficar sem acesso à recuperação.
- Dicas, controles e texto estão em português; cor e áudio não são os únicos sinais.
- Progresso sobrevive a recarregar quando armazenamento local está disponível.
- Build reproduzível no Linux e smoke test em Chromium e Firefox desktop.
- Arte reconhecível a partir das referências selecionadas e aprovada por Felipe,
  sem conteúdo grotesco adicional nem assets de origem/licença indefinida publicados.
- Não há tráfego de dados do jogador, autenticação ou dependência de API externa.

Testes futuros: regras de montagem/movimento/interação com testes de domínio;
soluções das seis fases como regressão; um teste integrado do início ao final,
incluindo desfazer, reiniciar e retomar. Não há testes de aplicação nesta entrega documental.

## 11. Playtest e participação posterior

Felipe acompanha a primeira sessão sem explicar a solução de imediato.
Anotar manualmente, fora do aplicativo:

- O jogador entende como mover e montar na primeira sala?
- Consegue resolver as duas primeiras salas sem explicação oral da solução?
- Percebe por que uma montagem não cabe e tenta reorganizá-la?
- Consegue explicar a utilidade de cada módulo?
- Em quais salas precisa de dicas, reinicia ou demonstra frustração?
- Reconhece a inspiração visual e considera as criaturas agradáveis de observar?
- Ao terminar, quer repetir, inventar uma peça ou criar uma fase?

Sinal para seguir: compreende a montagem, usa uma reconfiguração deliberadamente e
demonstra interesse em outra fase ou contribuição. Esses sinais ainda não foram validados.
Se a montagem frustrar, simplificar a interface e as primeiras salas antes de ampliar conteúdo.

Após jogar, convidá-lo a escolher uma contribuição pequena: desenhar uma nova peça,
dar nome à criatura ou projetar uma sala em papel. Isso orientará a v0.1.

## 12. Sequência futura de implementação

1. No Linux, estabelecer toolchain e uma sala jogável com pé e garra.
2. Validar montagem, colisão, interação e recuperação antes de criar a campanha.
3. Adicionar olho, extensor e testar se as suas restrições produzem puzzles distintos.
4. Construir as seis salas com soluções de referência verificadas.
5. Integrar arte revisada, instruções, dicas, áudio e progresso.
6. Executar critérios de aceite e entregar a surpresa para playtest.

Primeiro marco técnico: uma sala completa, reiniciável e solucionável.
Marco de entrega ao jogador: seis salas acabadas, não um protótipo sem encerramento.

## 13. Pendências para a próxima sessão

- Selecionar referências visuais específicas e produzir amostra para Felipe.
- Definir a procedência e as condições de publicação das imagens finais.
- Escolher toolchain e versões suportadas no Linux.
- Validar layouts e dificuldade; tamanhos e tempo de sessão são hipóteses iniciais.

A idade do jogador pode ajudar a calibrar textos posteriormente, mas não bloqueia
o início técnico. A implementação e a produção de conceito visual foram autorizadas posteriormente por Felipe; a publicação de imagens continua sujeita a RIGHTS (docs/legal/rights-and-references.md).
