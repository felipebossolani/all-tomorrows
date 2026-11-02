# Conceito inicial — Sob a superfície

Status: active
Owner: project maintainer
Updated: 2026-11-02

## Proposta para avaliação

Uma aventura de descoberta na sequência dos capítulos do livro. Cada espécie
muda o jeito de atravessar o ambiente. O primeiro teste foi Worms escavando; a etapa atual conecta essa introdução a Titans. Star People e Qu aparecem apenas no contexto inicial;
não haverá personagens inventados apresentados como personagens da obra.

A amostra está em `/concept.html`. Preserva a campanha atual em `/` e não altera
seu progresso. É um experimento de movimento, não uma nova versão completa.

## Primeiro minuto

O jogador já começa no subsolo. E ou o botão Escavar alterna escavação;
setas/WASD movem continuamente. Pelo mouse, clicar no destino ou segurar as setas
move o corpo; o mesmo botão alterna escavação. Escavar abre um caminho persistente.
Rochas obrigam a contornar obstáculos; três raízes incentivam exploração. Depois,
alcançar o abrigo conclui Worms e permite avançar para Titans. R e Reiniciar restauram tudo.

Não há montagem, inventário, diálogo obrigatório, morte ou relógio. O clique
indica direção em linha reta, sem navegação automática ao redor das rochas.
O jogador pode mudar de direção a qualquer momento; voltar por um túnel é mais rápido.
A pergunta do teste é se mover e transformar o terreno já dá vontade de continuar.
Raízes e abrigo são objetivos inventados para esse teste, não eventos canônicos.

## Base canônica e visual

Fonte primária de conteúdo: reprodução da edição de 2006, capítulos Star People,
Qu e Worms (páginas impressas 14, 21 e 26–27).
[PDF consultado](https://cdnc.heyzine.com/files/uploaded/v2/c130e1b1f774bc5d8c15d00a684e0ada39651588.pdf).
[Índice auxiliar da wiki](https://all-tomorrows.fandom.com/wiki/Category:Species).
A wiki inclui entradas Redux; não misturar essas entradas com o recorte de 2006.

Worms são descendentes modificados dos Star People. Vivem no subsolo de um mundo
muito quente; têm corpos alongados, olhos reduzidos e membros para escavar.
São um dos primeiros capítulos pós-Qu, mas não o começo integral da história.
A sucessão de capítulos não deve ser apresentada como uma única linhagem evolutiva.

A ilustração da página 27 foi renderizada e examinada localmente: corpo longo e
pálido, cabeça integrada ao tronco, olhos diminutos, braços curtos perto da cabeça
e pés pequenos na extremidade posterior. Evitar olhos grandes, sorriso de mascote,
corpo segmentado de minhoca genérica ou membros enormes. A referência permanece em
/tmp, fora do Git. A cena usa uma forma simplificada de desenvolvimento e não
constitui aprovação de fidelidade visual ou asset final. Aplicam-se os
[direitos e condições de publicação](../legal/rights-and-references.md).

## Aceite antes de ampliar

- Felipe consegue explicar o objetivo e usar os controles sem orientação externa.
- O movimento e a escavação interessam por si, sem depender de texto introdutório.
- O recorte e a futura anatomia são reconhecíveis para quem conhece a obra.
- Teclado e mouse completam a cena independentemente.
- Só depois da avaliação definir o próximo capítulo; não pesquisar todo o elenco.

## Implementação

HTML, CSS, SVG e TypeScript na toolchain existente, sem novas dependências.
`src/concept/` é um experimento isolado: não altera o motor de puzzles.
Movimento por requestAnimationFrame, delta limitado e colisão com rochas;
terreno escavado em células de 20 unidades. Perda de foco interrompe movimento.
Sem persistência nova. Testes de navegador verificam conclusão e reinício.
Não reutilizar esse controlador como arquitetura definitiva sem validar o conceito.

## Direção aprovada — introdução e progressão

Felipe jogou a amostra no Orca e pelo Tailscale e confirmou melhora na experiência.
Em seguida, aprovou a direção de uma campanha que começa como introdução e aumenta
progressivamente a dificuldade e as possibilidades de jogo. Isso valida a direção
mecânica; não equivale à aprovação das formas provisórias como arte final.

- Começo: aprender movimento e escavação em segurança, com retorno imediato.
- Dentro de cada fase: apresentar uma habilidade, permitir experimentar e depois
  propor uma situação que exige usá-la de maneira um pouco mais elaborada.
- Entre fases: preservar controles e conhecimentos úteis; introduzir uma habilidade
  corporal por vez. A troca de espécie não deve reiniciar todo o aprendizado.
- Aumentar decisões, combinações e possibilidades de percurso antes de exigir
  reflexos. Evitar usar velocidade, punição ou repetição como única dificuldade.
- Trechos finais combinam habilidades já ensinadas; não introduzir regra essencial
  inédita no último desafio. Recuperação rápida e dicas continuam disponíveis.

O recorte autorizado é Worms refinada e Titans completa, com transição entre ambas.
A seleção provisória da campanha é Worms, Titans, Predators/Prey, Swimmers,
Flyers e Modular People; referências e viabilidade das habilidades ainda precisam
ser verificadas antes de fechar cada fase. São capítulos selecionados com saltos
no tempo, não uma linhagem única. Não ampliar além das seis fases.

## Iteração de duas fases — contrato de interação

E é a tecla fixa da habilidade, indicada no botão e na primeira instrução. Funciona
mesmo quando outro controle do jogo está focado. Espaço também executa a habilidade
com foco no cenário; em botões, Espaço e Enter preservam a ativação nativa.
R reinicia a fase atual. Setas/WASD movem. A transição entre capítulos recebe foco
para avançar com Enter; o cenário recupera foco ao começar a fase seguinte.
Todos os comandos continuam disponíveis por mouse, inclusive reinício e transição.

Worms mantém seu percurso e ensina escavação, desvio de rochas e combinação dos dois.
Titans troca terreno escavável por duas passagens bloqueadas por troncos: aproximar,
usar força e atravessar. A segunda passagem exige reposicionar o corpo e reconhecer
o mesmo padrão em outra orientação de percurso. Usar força longe do tronco não o
remove. Reiniciar restaura ambos os obstáculos. Não há punição, contagem de tempo
ou progressão artificial para estender a duração.

### Referência de Titans

Texto e ilustração das páginas impressas 28–29 da mesma reprodução de 2006 foram
examinados. A anatomia observada tem face de origem humana, bochechas largas, olhos
pequenos, membros maciços e prolongamento do lábio inferior em tromba muscular.
Não confundir essa tromba com o nariz de um elefante. O livro situa os Titans em
savanas e descreve manipulação de árvores e madeira. A cena de desobstruir uma
passagem é uma adaptação de jogo, não um acontecimento narrado pelo autor.

A página ilustrada foi renderizada em `/tmp/titans-reference.png`, fora do Git.
O jogo usa apenas desenho esquemático provisório; reconhecimento visual e condições
de distribuição de arte final continuam sendo etapas separadas.
