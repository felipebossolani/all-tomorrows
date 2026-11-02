# Cooperação e descoberta — revisão v0.2

Status: active
Owner: project maintainer
Updated: 2026-11-02

## Problema observado

Felipe concluiu a primeira sala sem entender o propósito da montagem e sem uma
recompensa interessante. A alternância obrigatória entre teclado e mouse atrapalha.
Paleta e layout foram aprovados. A referência aos Modular People estava concentrada
na regra de montagem, sem se expressar suficientemente no mundo e nas ações.

## Decisão

Começar com corpo funcional e ensinar movimento antes de montagem. Apresentar uma
necessidade concreta no cenário e oferecer formas prontas com nome, desenho e
propósito. Montagem livre passa a ser opcional, mantendo as regras originais.
Cada uma das seis salas é uma situação original de cooperação com uma colônia:
objetivos de entrega, ativação ou chegada, acompanhados de reação visual e desfecho.
Não alegar que as situações são episódios do livro. A inspiração está na união de
unidades especializadas para resolver necessidades coletivas.

## Controles

Teclado e mouse são caminhos completos e independentes. Testar campanha inteira
com cada dispositivo, incluindo escolha de formas e avanço. Teclado: Tab/Enter
para controles, setas/WASD para movimento, interação, desfazer e reinício; atalhos
visíveis para formas. Mouse: todos os comandos têm botões. Não exigir arrastar.
Prévia não altera estado confirmado. Cancelar preserva o corpo, desfazer restaura
a ação inteira e reiniciar funciona em qualquer modo. Seleção ambígua é explícita.

## Apresentação

Preservar paleta de papel/verde e tipografia editorial. Dar vida por respiração,
olhar, movimento, reação dos companheiros e transformação da sala ao concluir.
Animações não bloqueiam comandos e respeitam preferência por movimento reduzido.
Usar recursos originais em código; direitos de personagens continuam separados.

## Contrato técnico

Level recebe objective, presets, companion e intro opcionais. objective.type
suporta deliver, activate e arrive. State.delivered passa a significar conclusão
da missão, conservando o contrato de snapshots. Regras puras e comandos permanecem.
Cada solução de referência usa somente montagens que existem em presets, sem
impedir montagens livres válidas. As provas das salas 4/5 continuam obrigatórias.

## Aceite

- Primeira ação pode ser andar, sem configurar corpo ou ler tutorial longo.
- Cada mudança de forma tem motivo visível e prévia antes de confirmar.
- Seis missões incluem os três tipos de objetivo e desfechos distintos.
- Campanha completa passa mouse-only e keyboard-only em Chromium e Firefox.
- Recuperação, armazenamento indisponível e seleção de alvo têm regressões.
- Corpo, companheiros e ambiente reagem; controles essenciais cabem em 1280×720.
- Julgamento de diversão e dificuldade infantil permanece reservado ao playtest.
