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
