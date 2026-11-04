const { Given, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// Steps usados por mais de uma história (US01 e US02).

Given('que a redatora {string} criou a edição {string}', function (nome, titulo) {
  const autora = { nome, papel: 'redator' }
  this.edicao = this.servico.criarEdicao(titulo, autora)
})

Then('devo ver a mensagem {string}', function (esperada) {
  assert.equal(this.resultado.mensagem, esperada)
})

Then('a edição deve estar {estado}', function (estadoEsperado) {
  assert.equal(this.edicao.estado, estadoEsperado)
})
