const { Given, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// Steps usados por mais de uma história (US01 a US04).

Given('que a redatora {string} criou a edição {string}', function (nome, titulo) {
  const autora = { nome, papel: 'redator' }
  this.edicao = this.servico.criarEdicao(titulo, autora)
})

Given('que estou autenticada como gestora {string}', function (nome) {
  this.usuario = { nome, papel: 'gestor' }
})

// Gera e-mails distintos por segmento, para não criar sobreposição sem querer.
Given('que o segmento {string} tem {int} assinantes', function (nome, quantidade) {
  const prefixo = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const emails = Array.from({ length: quantidade }, (_, i) => `${prefixo}-${i + 1}@exemplo.com`)
  this.servico.adicionarAoSegmento(nome, emails)
})

Then('devo ver a mensagem {string}', function (esperada) {
  assert.equal(this.resultado.mensagem, esperada)
})

Then('a edição deve estar {estado}', function (estadoEsperado) {
  assert.equal(this.edicao.estado, estadoEsperado)
})
