const { defineParameterType } = require('@cucumber/cucumber')

// Parâmetro próprio: permite escrever "a edição está aguardando revisão" no
// Gherkin (sem aspas) e receber no step o nome interno do estado.
const ESTADOS = {
  'em rascunho': 'rascunho',
  'aguardando revisão': 'aguardando_revisao',
  aprovada: 'aprovada'
}

defineParameterType({
  name: 'estado',
  regexp: /em rascunho|aguardando revisão|aprovada/,
  transformer: (texto) => ESTADOS[texto]
})

// US03 — horário escrito como no calendário: "09/03/2026 às 09h30".
// O NewsFlow agenda no fuso America/Sao_Paulo (RN03). Desde 2019 o Brasil não
// tem horário de verão, então esse fuso é sempre UTC-3. O step compara Date com
// Date (instantes), não textos formatados.
defineParameterType({
  name: 'horario',
  regexp: /\d{2}\/\d{2}\/\d{4} às \d{2}h\d{2}/,
  transformer: (texto) => {
    const [, dia, mes, ano, hora, minuto] = texto.match(/(\d{2})\/(\d{2})\/(\d{4}) às (\d{2})h(\d{2})/)
    return new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00-03:00`)
  }
})

// Situação de um disparo: "o disparo deve estar cancelado".
defineParameterType({
  name: 'situacao',
  regexp: /agendado|cancelado|enviado/,
  transformer: (texto) => texto
})
