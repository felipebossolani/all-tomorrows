# Lições

Status: active
Owner: project maintainer
Updated: 2026-11-02

## 2026-11-02 — Publicação de repositório pelo Git

- Padrão: migrar para upload pelo navegador quando o terminal encontra restrição de rede.
- Correção de Felipe: publicar com commit e push pelo terminal.
- Regra: preparar o commit local e tentar o push com Git. Se o ambiente bloquear rede,
  informar o bloqueio concreto; não substituir por upload no navegador.

## 2026-11-02 — Fidelidade visual é requisito de produto

- Padrão: assumir criaturas e arte originais sem confirmar a importância da aparência do livro.
- Correção de Felipe: as imagens precisam ser fiéis ao livro; não quer algo grotesco.
- Regra: preservar anatomia, proporções e características reconhecíveis das referências.
  Não trocar por mascotes genéricos nem intensificar horror. Tratar direitos de publicação
  separadamente da direção visual e revisar uma amostra antes do conjunto final.

## 2026-11-02 — Estrutura documental consistente

- Padrão: criar documentos com nomes ad hoc na raiz, misturando produto, desenho técnico e handoff.
- Correção: padronizar documentação e nomenclaturas como repositórios e harnesses maduros.
- Regra: seguir docs/index.md; nomes em inglês kebab-case, documentos por responsabilidade, links relativos e estado explícito. Atualizar AGENTS.md ao mudar os pontos de entrada.

## 2026-11-02 — Avaliação do conjunto

- Correção: Felipe autorizou seguir criativamente até o final e avaliar o conjunto depois.
- Regra: não bloquear a implementação em revisão visual intermediária; preservar fidelidade e condições de publicação dos assets.

## 2026-11-02 — Aprendizado e controles completos

- Feedback de Felipe: a primeira fase exige montagem sem explicar seu propósito e termina sem recompensa interessante; alternar mouse e teclado prejudica a experiência. A paleta e o layout foram bem recebidos.
- Regra: ensinar a utilidade de mudar o corpo antes de exigir montagem livre; validar uma primeira fase revisada antes de aplicar mudanças à campanha. Discutir propostas antes de alterar o jogo.
- Requisito confirmado: teclado resolve o jogo inteiro e mouse também oferece comandos completos, incluindo movimento, interação, montagem, desfazer, reiniciar e navegação. Nenhum fluxo deve exigir alternância entre os dois.

## 2026-11-02 — Inspiração precisa aparecer na experiência

- Padrão: uma mecânica abstrata de montagem e o nome da obra não bastam para um fã reconhecer a inspiração.
- Regra: expressar cooperação, unidades especializadas e transformação do corpo nas situações, reações e objetivos; separar explicitamente cenas originais de fatos do livro. Não tentar resolver ausência de propósito só com arte.

## 2026-11-02 — Personagens e sequência reconhecíveis

- Correção: o jogador gostou do layout, mas não reconheceu Lio; Felipe quer progressão incremental na sequência do livro, com personagens reais da obra.
- Padrão: inventar Lio e Nara para dar propósito à cooperação enfraqueceu a identificação com All Tomorrows.
- Regra: usar espécies e eventos canônicos verificados como base da progressão; não apresentar personagens inventados como pertencentes ao livro. Distinguir ordem dos capítulos, cronologia e linhagens evolutivas. Manter a apresentação aprovada e definir a adaptação antes de refazer a campanha.

## 2026-11-02 — Não transferir coleta em massa ao usuário

- Correção: pedir PDFs individuais de uma wiki com muitas páginas cria trabalho manual desnecessário para Felipe.
- Regra: investigar API e fontes consultáveis em lote; usar o livro como fonte primária e resultados indexados como apoio identificado. Pedir ajuda apenas para material indispensável que não seja acessível por esses meios. Não alegar leitura completa a partir de snippets.

## 2026-11-02 — Validar o começo antes de ampliar

- Correção: nesta etapa, pesquisar apenas as espécies iniciais necessárias para fechar o conceito com Felipe.
- Regra: limitar pesquisa e protótipo ao começo da experiência; validar reconhecimento da obra, fluidez e diversão antes de ampliar elenco, arte ou campanha. Não transformar acesso à wiki em levantamento completo como pré-requisito.

## 2026-11-02 — Executar antes de prometer retorno

- Correção: uma resposta encerrada prometendo voltar não inicia trabalho em segundo plano.
- Regra: iniciar ferramentas e produzir o resultado autorizado na mesma execução; nunca sugerir que há trabalho ativo quando a sessão foi encerrada.

## 2026-11-02 — Validar endereço de acesso remoto

- Correção: a amostra abriu no Orca, mas o acesso remoto usado anteriormente falhou.
- Diagnóstico: IP Tailscale respondeu 200; nome MagicDNS foi rejeitado pelo Vite com 403. O link entregue também usava endereço LAN.
- Regra: testar IP e hostname Tailscale antes de entregar links remotos; configurar hosts explícitos e distinguir teste local de validação no dispositivo do usuário.
