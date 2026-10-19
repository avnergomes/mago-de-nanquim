# Mago de Nanquim

Projeto de fã, sem fins comerciais e sem vínculo oficial. Releitura em 3D, para navegador, do jogo Android *Magic Survival* (LEME). Mantém a arte do original
(espíritos mutantes como manchas de nanquim espinhosas com núcleo colorido, pisos chapados por setor,
mago em silhueta preta) e adiciona volume 3D, contorno de tinta com traço que "ferve" a 8 quadros/s
e câmera em perspectiva inclinada atrás do mago.

Luz e sombra: sol com sombra projetada de borda dura (shadow map preso à grade de texels, sem cintilar),
contraluz fria para recortar silhuetas, 6 luzes dinâmicas reaproveitadas pelas magias mais fortes na tela,
brilho da gema do cajado, relevo nos pisos e tom de luz próprio para cada setor.

Traço (`src/render/post.js`): contorno externo de um lado só, mais grosso de perto; segunda passada de
pena deslocada, como esboço; dobras internas finas pela profundidade inversa; linhas coloridas em magia
brilhante; pressão variável ao longo do traço. Rachaduras do piso afinam nas pontas e têm tufos de hachura.

Magias usam um material próprio (`src/render/fxmat.js`): núcleo incandescente em degraus, energia correndo
pela superfície, áreas no chão com anéis rúnicos girando, rastro de brasas, faíscas no impacto e poça de luz
sob o que brilha. O mago flutua, inclina na direção em que desliza e deixa poeira mágica no rastro.

## Rodar

```bash
docker compose up -d --build
# abra http://localhost:8080
```

Tudo roda offline depois do build (o three.js 0.186.1 é copiado para dentro da imagem).

## Publicar no GitHub Pages (link para instalar como app)

O repositório já vem pronto: `.github/workflows/pages.yml` monta o site com `scripts/build-site.sh`
(o mesmo script do Dockerfile) e publica a cada push na `main`.

1. Repositório **público** no GitHub (Pages grátis só em repositório público).
2. Em Settings > Pages > Build and deployment, **Source: GitHub Actions**.
3. A cada push na `main`, a aba Actions publica em `https://<usuario>.github.io/<repositorio>/`.

Funciona em subcaminho (`/mago-de-nanquim/`) porque todos os caminhos são relativos. Quem abrir vê o
botão "Instalar no aparelho" (Android e Chrome/Edge no PC); no iPhone, Compartilhar e "Adicionar à
Tela de Início". Depois da primeira abertura o jogo funciona sem internet.

Para outra hospedagem estática (Netlify Drop, Cloudflare Pages), `sh build-dist.sh` gera `./dist`.
Ao publicar uma versão nova, troque `CACHE` em `sw.js` (ex.: `nanquim-v2`).

Em `localhost` o service worker fica desligado (cada rebuild aparece na hora); teste o PWA em
http://127.0.0.1:8080. O `window.dbg` só existe em localhost/127.0.0.1.

## Controles

- `WASD` ou setas: andar. No celular: arraste em qualquer ponto da tela.
- `1`-`4`: escolher carta. `Esc` ou `P`: pausar.
- As magias disparam sozinhas, como no original.

## O que tem do jogo original

Dados extraídos do wiki da comunidade (magic-survival-rpg.fandom.com, versão 0.956):

- **17 magias de ataque + 4 utilitárias**, cada uma com seus níveis (7 ou 5) e os bônus exatos por nível.
- **63 atributos** (3 por magia, escolhidos no nível máximo; o Projétil Mágico escolhe também no nível 4).
- **8 passivas comuns**, **8 passivas de crescimento** (após o nível 100) e **23 passivas especiais** (vindas de baús de elites e chefes), aqui chamadas de relíquias.
- **25 combos** com os pré-requisitos do wiki.
- **24 classes** (wiki, página Classes), escolhidas na tela inicial. Cada classe ligada a uma magia começa com ela
  2 níveis acima, ganha +3% de dano nela a cada 5 níveis, recarga/número/tamanho próprios e +20% de dano.
  As especiais seguem as regras do original: Arcanista (+1% de dano por nível, uma carta a menos), Bispo
  (+10% de ATK por escudo, Anjo da Guarda), Erudito e Arquimago (começam 3 níveis acima), Arqueólogo (baú a
  cada 15 níveis), Ilusionista (30% de chance de o projétil virar outra magia) e Mago Negro (inimigos explodem
  com 75% do HP máximo).

Inimigos, setores e itens também seguem o original (NamuWiki 매직서바이벌, seções 7.1 e 9, e capturas da Play Store):

- **14 espíritos mutantes**: Swarm (rola como capim seco), Scarab e Interceptor (voam reto e explodem ao tocar),
  Corrupt (explode ao morrer), Mine, Rampage e Invader (aceleram ao serem atingidos), Hive, Overlord (cresce ao
  levar dano), Colony (espalha 5 nuvens de gás), Atlas (75% de resistência a controle), Terra (escurece a área),
  Citadel (atravessa a horda e explode ao morrer), Howling. Elites com contorno vermelho, 50% de resistência.
- **5 setores de 4 minutos** como no Ecossistema Artificial: Arranjos, Laboratório, Esgoto, Arboreto e Usina,
  cada um com piso próprio, evento no meio (chuva de Scarabs, alerta vermelho...) e onda final que larga a Caixa Preta.
- **Itens reais**: orbes de mana P/M/G, orbe de vida, baú, Caixa Preta e as runas de Invencibilidade,
  Frenesi, Ganância e Purificação. HP base 200.

O que é criação desta releitura:

- O **efeito visual e mecânico de cada combo**. O wiki só lista os pré-requisitos.
- Cinco combos usam nomes de atributo que não existem mais no jogo atual (Tera Corrente,
  Mestre das Tempestades, Sintonia Elétrica, Raio do Nada, Dilúvio). Foram ligados ao atributo
  mais parecido; estão marcados com `guess: true` em `src/data/combos.js`.
- Números de HP, dano e velocidade dos inimigos (o jogo não os publica) e a curva de dificuldade.
- Tesouros dos baús: além das 23 relíquias do original há **13 relíquias novas** e **16 artefatos**
  (criação desta releitura, não os artefatos do jogo original). Artefatos são mais fortes e às vezes cobram um
  preço (o Grimório Proibido tira HP máximo). A Caixa Preta garante um artefato; no baú comum cada carta tem 15%
  de chance de ser artefato. Mecânicas novas: esquiva, dano extra contra elites e chefes, execução abaixo de 8%
  do HP e cura por abate.
- Ícones de magias, classes, tesouros, passivas e HUD são ilustrações SVG geradas por código (`src/render/`).
  O jogo não usa emojis: `node scripts/check-no-emoji.mjs` verifica isso e roda no GitHub Actions antes de publicar.
- Classes: no original elas sobem de nível com material de pesquisa; aqui a classe escolhida já vem com os
  bônus dos níveis 1 a 5. O botão "Recuperar mana" (pular a escolha de nível) devolve 50% da mana do nível;
  o valor base é estimativa, já que o wiki não publica. O bônus de dano dos combos do Arquimago vale para os efeitos-assinatura dos combos.
- Vitória aos 20 min, depois modo infinito.

Fora do escopo: os artefatos equipáveis do original, progressão permanente entre partidas (pesquisa, ouro) e som.

## Estrutura

```
src/data/       tabelas puras: magias, passivas, combos, inimigos e setores
src/game/       estado, jogador, inimigos (grade espacial), combate, coleta, UI
src/game/spells executores das magias, utilitárias e combos
src/render/     instanciamento em lote, modelos procedurais, texturas, passe de tinta
```

## Teste de fumaça (console do navegador)

```js
dbg.grantAll()   // as 21 magias no máximo, com atributo
dbg.comboAll()   // força os atributos dos 25 combos e ativa todos
dbg.god()        // invulnerável
dbg.spawn(500)   // teste de carga
dbg.time(299)    // pula para o primeiro chefe
```

Medido em um desktop: 500 inimigos no limite do vsync (60 fps); com as 21 magias no máximo, ~2,3 ms de JS por quadro. Sem erros no console.
