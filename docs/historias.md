# Histórias de usuário — NewsFlow

## US01 — Salvar rascunho automaticamente

**Como** redatora
**Quero** que meu texto seja salvo enquanto escrevo
**Para** não perder trabalho quando a conexão cair

**Critérios de aceitação**

- Toda edição nova nasce como rascunho.
- O rascunho é salvo a cada 30 segundos, desde que o texto tenha mudado.
- Cada salvamento cria uma versão numerada, em sequência.
- O sistema mantém apenas as últimas 20 versões; as mais antigas são descartadas.
- Uma versão mantida pode ser restaurada, e restaurar não apaga as demais versões.

**Regras cobertas:** RN01
**Prioridade:** Alta — perda de conteúdo é a reclamação número um dos redatores.
**Cenários:** `features/us01-rascunho.feature`

---

## US02 — Aprovar a edição antes do envio

**Como** revisora
**Quero** aprovar ou reprovar as edições escritas por outras pessoas
**Para** que nenhum erro de conteúdo chegue aos 40 mil assinantes

**Critérios de aceitação**

- Uma edição só pode ser enviada ou agendada depois de aprovada por um revisor.
- O autor de uma edição não pode aprovar a própria edição.
- Reprovar exige um comentário.
- A reprovação devolve a edição ao rascunho e registra o comentário para o redator.

**Regras cobertas:** RN02
**Prioridade:** Alta — um e-mail com erro, depois de disparado, não pode ser desfeito.
**Cenários:** `features/us02-aprovacao.feature`

---

## US03 — Agendar envio

**Como** gestora de comunicação
**Quero** agendar, reagendar ou cancelar o envio de uma edição aprovada
**Para** que ela chegue no melhor horário sem eu precisar apertar o botão na hora

**Critérios de aceitação**

- O envio só pode ser agendado para no mínimo 15 minutos à frente, no fuso America/Sao_Paulo (horário de Brasília).
- Um envio agendado pode ser reagendado no máximo 2 vezes, sempre respeitando os 15 minutos de antecedência.
- Um envio agendado pode ser cancelado até 5 minutos antes do horário marcado; depois disso, segue como está.
- Só uma edição aprovada pode ser agendada (portão da RN02).

**Regras cobertas:** RN03 (e RN02, no portão de aprovação)
**Prioridade:** Alta — sem agendamento a gestora fica refém do horário, e um envio que não pode ser cancelado a tempo vira erro público.
**Cenários:** `features/us03-agendamento.feature`

---

## US04 — Enviar a edição só para os segmentos escolhidos

**Como** gestora de comunicação
**Quero** escolher para quais segmentos de assinantes a edição vai
**Para** que cada público receba só o que interessa, sem e-mail repetido

**Critérios de aceitação**

- Uma edição pode ir para no máximo 5 segmentos.
- Se algum segmento escolhido não tiver assinantes, o agendamento é bloqueado e nada fica agendado.
- Quem está em mais de um segmento escolhido recebe um único e-mail da edição.
- Assinantes de segmentos não escolhidos não recebem a edição.

**Regras cobertas:** RN04
**Prioridade:** Média — o envio funciona sem refinamento de público, mas e-mail duplicado ou fora do perfil desgasta a lista e aumenta descadastros.
**Cenários:** `features/us04-segmentacao.feature`
