# Conceito inicial — Sob a superfície

Status: draft
Owner: project maintainer
Updated: 2026-11-02

## Proposta para avaliação

Uma aventura de descoberta na sequência dos capítulos do livro. Cada espécie
muda o jeito de atravessar o ambiente. Antes de definir a campanha, testar uma
única cena: Worms escavando. Star People e Qu aparecem apenas no contexto inicial;
não haverá personagens inventados apresentados como personagens da obra.

A amostra está em `/concept.html`. Preserva a campanha atual em `/` e não altera
seu progresso. É um experimento de movimento, não uma nova versão completa.

## Primeiro minuto

O jogador já começa no subsolo. Espaço ou o botão Escavar alterna escavação;
setas/WASD movem continuamente. Pelo mouse, clicar no destino ou segurar as setas
move o corpo; o mesmo botão alterna escavação. Escavar abre um caminho persistente.
Rochas obrigam a contornar obstáculos; três raízes incentivam exploração. Depois,
alcançar o abrigo encerra a amostra. R e Reiniciar restauram tudo.

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
