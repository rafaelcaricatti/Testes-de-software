# NewsFlow — BDD com Cucumber

Histórias de usuário, cenários em Gherkin e testes automatizados com Cucumber.js para o **NewsFlow**, a plataforma de newsletters e notificações da Vértice. O domínio roda em memória, com um relógio falso: nenhum cenário depende da hora da máquina nem usa `sleep`.

## Como rodar

```bash
npm install          # instala o Cucumber.js
npm run test:dry     # valida a sintaxe e confere se todo passo tem implementação
npm test             # executa a suíte e gera relatorios/cucumber-report.html
```

## Histórias e rastreabilidade

| História | Regras | Cenários |
|---|---|---|
| US01 — Salvar rascunho automaticamente | RN01 | `features/us01-rascunho.feature` |
| US02 — Aprovar a edição antes do envio | RN02 | `features/us02-aprovacao.feature` |
| US03 — Agendar envio | RN03 (+ RN02) | `features/us03-agendamento.feature` |
| US04 — Enviar a edição só para os segmentos escolhidos | RN04 | `features/us04-segmentacao.feature` |

O texto completo das histórias, com critérios de aceitação e prioridade, está em [`docs/historias.md`](docs/historias.md).

As quatro histórias seguem o fluxo editorial de uma edição, do começo ao fim: **escrever → aprovar → agendar → entregar ao público certo**.

## Fora de escopo

- **RN05 — Frequência:** só é observável com várias edições disparadas ao longo de semanas e uma fila para a semana seguinte; é uma história própria, que pressupõe o agendamento e a segmentação já prontos.
- **RN06 — Descadastro:** é a jornada do assinante (link de saída, confirmação e duplo opt-in de 48 horas), um ator diferente do fluxo editorial que as nossas quatro histórias contam.
- **RN07 — Falha de entrega:** depende das respostas do provedor de e-mail (tentativas, hard e soft bounce) e interessa à operação, não a quem escreve, aprova ou agenda a edição.
- **RN08 — Notificação:** trata do canal push, com janela de silêncio e limite diário próprios; misturá-la ao e-mail incharia as histórias de agendamento e segmentação.

## Estrutura

```
├── cucumber.js                      configuração (steps, formato e relatório HTML)
├── docs/historias.md                US01 – US04
├── features/
│   ├── us01-rascunho.feature
│   ├── us02-aprovacao.feature
│   ├── us03-agendamento.feature
│   ├── us04-segmentacao.feature
│   ├── step_definitions/            um arquivo de steps por história + comuns.steps.js
│   └── support/
│       ├── dominio.js               regras RN01 – RN04 em memória
│       ├── parametros.js            tipos de parâmetro ({estado}, {horario}, {situacao})
│       └── world.js                 estado de cada cenário (recriado a cada cenário)
└── relatorios/cucumber-report.html  relatório navegável da última execução
```

## Saída de `npm test`

```
> newsflow-bdd@1.0.0 test
> cucumber-js

......................................................................................................................................................................................................................

34 scenarios (34 passed)
214 steps (214 passed)
0m 0.161s (0m 0.057s executing your code)
```
