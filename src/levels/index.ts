import type { Command, Level, Module } from "../domain/types";

const piece = (kind: Module["kind"], x: number, y: number): Module => ({
  kind,
  x,
  y,
});
const assemble = (...modules: Module[]): Command => ({
  type: "assemble",
  modules,
});
const move = (dx: number, dy: number): Command => ({ type: "move", dx, dy });
const interact = (target: string): Command => ({ type: "interact", target });
const right = move(1, 0);
const down = move(0, 1);
const left = move(-1, 0);

const walker = [piece("foot", -1, 0)];
const line = [piece("foot", -1, 0), piece("claw", 1, 0)];
const downwardArm = [piece("foot", -1, 0), piece("claw", 0, 1)];
const lookout = [piece("foot", 0, -1), piece("claw", 1, 0)];
const reader = [piece("foot", -1, 0), piece("claw", 1, 0), piece("eye", 0, -1)];
const bentArm = [
  piece("foot", -1, 0),
  piece("extender", 1, 0),
  piece("claw", 1, 1),
];
const gardenForm = [
  piece("foot", -1, 0),
  piece("eye", 0, -1),
  piece("extender", 1, 0),
  piece("claw", 1, 1),
];
const vertical = [piece("foot", 0, -1), piece("claw", 0, 1)];

export const levels: Level[] = [
  {
    id: 1,
    name: "A caixa no canteiro",
    instruction: "Ande até a estação e escolha um braço para levar a caixa.",
    intro:
      "Lio deixou uma caixa de brotos perto do canteiro. Ela só precisa de um empurrão gentil.",
    companion: {
      name: "Lio",
      dialogue:
        "Você já consegue andar. Na estação, experimente um braço voltado para a caixa.",
      position: { x: 6, y: 4 },
    },
    objective: {
      type: "deliver",
      title: "Leve os brotos",
      description: "Pegue a caixa de brotos e aproxime-a do canteiro de Lio.",
      itemLabel: "caixa de brotos",
      destinationLabel: "canteiro de Lio",
      success: "Lio começa a plantar os brotos.",
    },
    presets: [
      {
        id: "braco-frente",
        name: "Braço para a frente",
        description: "Alcança a caixa sem bloquear o caminho até o canteiro.",
        modules: line,
      },
      {
        id: "braco-baixo",
        name: "Braço para baixo",
        description: "Uma forma curta para explorar ao redor da estação.",
        modules: downwardArm,
      },
    ],
    map: [
      "#########",
      "#.......#",
      "#.......#",
      "#.......#",
      "#.......#",
      "#########",
    ],
    start: { x: 2, y: 2 },
    stations: [{ x: 3, y: 2 }],
    seed: { x: 5, y: 2 },
    nest: { x: 7, y: 4 },
    switches: [],
    doors: [],
    stock: { foot: 1, claw: 1, eye: 0, extender: 0 },
    initial: walker,
    hints: [
      "Dê um passo à direita: a estação está marcada no chão.",
      "O braço para a frente deixa a garra ao lado da caixa.",
    ],
    solution: [
      right,
      assemble(...line),
      interact("seed"),
      right,
      right,
      down,
      down,
      interact("nest"),
    ],
  },
  {
    id: 2,
    name: "A passagem de Nara",
    instruction:
      "Na estação, escolha uma forma em linha para atravessar a passagem.",
    intro:
      "Nara está do outro lado do corredor e combinou de encontrar você no marco azul.",
    companion: {
      name: "Nara",
      dialogue:
        "O corredor deixa passar um corpo em linha. Encontre-me no marco azul.",
      position: { x: 11, y: 2 },
    },
    objective: {
      type: "arrive",
      title: "Encontre Nara",
      description: "Atravesse a passagem e leve o núcleo até o marco azul.",
      itemLabel: "encontro",
      destinationLabel: "marco azul",
      success: "Nara acena do outro lado da passagem.",
      at: { x: 10, y: 3 },
    },
    presets: [
      {
        id: "linha",
        name: "Corpo em linha",
        description: "Deixa todas as partes no corredor central.",
        modules: line,
      },
      {
        id: "passo-alto",
        name: "Passo alto",
        description: "Útil em áreas abertas, mas largo demais para o corredor.",
        modules: lookout,
      },
    ],
    map: [
      "##############",
      "#.....###....#",
      "#.....###....#",
      "#............#",
      "#.....###....#",
      "#.....###....#",
      "##############",
    ],
    start: { x: 3, y: 3 },
    stations: [{ x: 3, y: 3 }],
    seed: { x: 1, y: 1 },
    nest: { x: 1, y: 1 },
    switches: [],
    doors: [],
    stock: { foot: 1, claw: 1, eye: 0, extender: 0 },
    initial: lookout,
    hints: [
      "A forma inicial anda, mas o pé fica acima do núcleo.",
      "Use Corpo em linha antes de entrar no corredor central.",
    ],
    solution: [
      assemble(...line),
      right,
      right,
      right,
      right,
      right,
      right,
      right,
    ],
  },
  {
    id: 3,
    name: "Luz para o abrigo",
    instruction: "Use o olho para ler o símbolo e acender a luz de Nara.",
    intro:
      "O abrigo de Nara ainda está escuro. O painel tem uma marca que só o olho revela.",
    companion: {
      name: "Nara",
      dialogue:
        "A luz-guia abre a porta do abrigo. O símbolo aparece quando você usa o olho.",
      position: { x: 9, y: 2 },
    },
    objective: {
      type: "activate",
      title: "Acenda a luz-guia",
      description: "Revele o símbolo e acione o painel da luz do abrigo.",
      itemLabel: "símbolo da luz",
      destinationLabel: "luz-guia do abrigo",
      success: "A luz-guia acende para Nara.",
      switchId: "luz-guia",
    },
    presets: [
      {
        id: "leitura",
        name: "Leitura segura",
        description: "Mantém olho, pé e garra juntos para localizar o símbolo.",
        modules: reader,
      },
      {
        id: "linha",
        name: "Braço em linha",
        description: "Alcança à frente, mas não revela o painel oculto.",
        modules: line,
      },
    ],
    map: [
      "############",
      "#.....#....#",
      "#..........#",
      "#..........#",
      "#..........#",
      "#.....#....#",
      "############",
    ],
    start: { x: 2, y: 3 },
    stations: [{ x: 2, y: 3 }],
    seed: { x: 8, y: 3 },
    nest: { x: 10, y: 4 },
    switches: [{ id: "luz-guia", x: 5, y: 3, hidden: true }],
    doors: [2, 3, 4].map((y) => ({ x: 6, y, switchId: "luz-guia" })),
    stock: { foot: 1, claw: 1, eye: 1, extender: 0 },
    initial: reader,
    hints: [
      "O olho revela a marca do painel quando está montado.",
      "Dê um passo à direita e deixe a garra ao lado do símbolo.",
    ],
    solution: [right, interact("luz-guia")],
  },
  {
    id: 4,
    name: "A ponte dobrada",
    instruction: "Dobre o braço com um extensor para abrir a ponte de Lio.",
    intro:
      "Lio precisa que a ponte abra para levar uma muda ao outro lado do riacho seco.",
    companion: {
      name: "Lio",
      dialogue:
        "O comando fica na curva. Um braço dobrado consegue alcançá-lo.",
      position: { x: 2, y: 6 },
    },
    objective: {
      type: "deliver",
      title: "Leve a muda pela ponte",
      description: "Abra a ponte e entregue a muda a Lio no outro lado.",
      itemLabel: "muda",
      destinationLabel: "jardim de Lio",
      success: "A muda chega ao jardim de Lio.",
    },
    presets: [
      {
        id: "braco-dobrado",
        name: "Braço dobrado",
        description: "O extensor sustenta a garra na curva do comando.",
        modules: bentArm,
      },
      {
        id: "linha",
        name: "Corpo em linha",
        description: "Passa pela ponte aberta levando a muda.",
        modules: line,
      },
    ],
    map: [
      "########",
      "#....###",
      "#....###",
      "#....###",
      "#.....##",
      "#......#",
      "#....###",
      "####.###",
      "########",
    ],
    start: { x: 4, y: 4 },
    stations: [{ x: 4, y: 4 }],
    seed: { x: 4, y: 5 },
    nest: { x: 4, y: 7 },
    switches: [{ id: "cotovelo", x: 6, y: 5, hidden: false }],
    doors: [1, 2, 3, 4].map((x) => ({ x, y: 5, switchId: "cotovelo" })),
    stock: { foot: 1, claw: 1, eye: 0, extender: 1 },
    initial: walker,
    hints: [
      "Só o núcleo e o extensor sustentam outras peças. Use o Braço dobrado.",
      "Depois de abrir a ponte, troque para Corpo em linha para levar a muda.",
    ],
    solution: [
      assemble(...bentArm),
      interact("cotovelo"),
      assemble(...line),
      left,
      interact("seed"),
      down,
      down,
      interact("nest"),
    ],
  },
  {
    id: 5,
    name: "Turno na estufa",
    instruction: "Abra a estufa com o olho e mude de forma na segunda estação.",
    intro:
      "Nara mantém a estufa fechada até reconhecer o símbolo de quem está ajudando.",
    companion: {
      name: "Nara",
      dialogue:
        "Mostre o símbolo, depois use a estação perto do túnel para levar o composto.",
      position: { x: 11, y: 2 },
    },
    objective: {
      type: "deliver",
      title: "Leve o composto",
      description: "Abra a estufa e leve o composto até a bandeja de Nara.",
      itemLabel: "composto",
      destinationLabel: "bandeja da estufa",
      success: "Nara distribui o composto nas bandejas.",
    },
    presets: [
      {
        id: "leitura",
        name: "Leitura segura",
        description: "Usa o olho para abrir a estufa sem perder a garra.",
        modules: reader,
      },
      {
        id: "linha",
        name: "Corpo em linha",
        description: "Atravessa o túnel estreito com o composto.",
        modules: line,
      },
    ],
    map: [
      "##############",
      "#.....###....#",
      "#.....###....#",
      "#............#",
      "#.....###....#",
      "#.....###....#",
      "##############",
    ],
    start: { x: 2, y: 3 },
    stations: [
      { x: 2, y: 3 },
      { x: 5, y: 3 },
    ],
    seed: { x: 10, y: 3 },
    nest: { x: 12, y: 4 },
    switches: [{ id: "passagem", x: 4, y: 3, hidden: true }],
    doors: [{ x: 7, y: 3, switchId: "passagem" }],
    stock: { foot: 1, claw: 1, eye: 1, extender: 0 },
    initial: reader,
    hints: [
      "A porta permanece aberta depois que você devolve o olho ao estoque.",
      "Na segunda estação, use Corpo em linha antes de entrar no túnel.",
    ],
    solution: [
      interact("passagem"),
      right,
      right,
      right,
      assemble(...line),
      right,
      right,
      right,
      interact("seed"),
      right,
      right,
      down,
      interact("nest"),
    ],
  },
  {
    id: 6,
    name: "Rota do jardim comum",
    instruction: "Abra o jardim, remonte o corpo e encontre os dois no portão.",
    intro:
      "Lio e Nara terminaram as mudas. Falta só abrir a rota até o jardim comum.",
    companion: {
      name: "Lio e Nara",
      dialogue:
        "Use tudo o que aprendeu: revele o sinal, abra a rota e venha ao portão.",
      position: { x: 7, y: 9 },
    },
    objective: {
      type: "arrive",
      title: "Chegue ao jardim comum",
      description:
        "Abra a rota e leve o núcleo até o portão onde Lio e Nara esperam.",
      itemLabel: "reencontro",
      destinationLabel: "portão do jardim comum",
      success: "Lio, Nara e você chegam juntos ao jardim comum.",
      at: { x: 7, y: 9 },
    },
    presets: [
      {
        id: "alcance",
        name: "Alcance dobrado",
        description: "Olho, extensor e garra alcançam o sinal na curva.",
        modules: gardenForm,
      },
      {
        id: "tunel",
        name: "Passagem vertical",
        description: "Cabe na rota estreita depois que ela estiver aberta.",
        modules: vertical,
      },
    ],
    map: [
      "###########",
      "#........##",
      "#........##",
      "#........##",
      "#........##",
      "#####.#####",
      "#####.#####",
      "#####.#####",
      "##.......##",
      "##.......##",
      "##.......##",
      "###########",
    ],
    start: { x: 3, y: 3 },
    stations: [
      { x: 3, y: 3 },
      { x: 5, y: 3 },
    ],
    seed: { x: 5, y: 9 },
    nest: { x: 7, y: 10 },
    switches: [{ id: "jardim", x: 5, y: 4, hidden: true }],
    doors: [{ x: 5, y: 6, switchId: "jardim" }],
    stock: { foot: 1, claw: 1, eye: 1, extender: 1 },
    initial: gardenForm,
    hints: [
      "O Alcance dobrado revela e aciona o sinal do jardim.",
      "Na segunda estação, escolha Passagem vertical para descer pela rota.",
    ],
    solution: [
      interact("jardim"),
      right,
      right,
      assemble(...vertical),
      down,
      down,
      down,
      down,
      down,
      down,
      right,
      right,
    ],
  },
];
