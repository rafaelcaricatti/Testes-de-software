# Histórias de usuário — NewsFlow

> As histórias US03 e US04 serão acrescentadas pelo outro membro da dupla.

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
