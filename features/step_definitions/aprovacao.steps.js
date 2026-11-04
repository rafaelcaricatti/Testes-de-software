const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// US02 — Aprovar a edição antes do envio (RN02)

Given('que estou autenticada como revisora {string}', function (nome) {
  this.usuario = { nome, papel: 'revisor' }
})

Given('que a edição está {estado}', function (estado) {
  this.levarEdicaoPara(estado)
})

When('aprovo a edição', function () {
  this.resultado = this.servico.aprovar(this.edicao, this.usuario)
})

When('reprovo a edição com o comentário {string}', function (comentario) {
  this.resultado = this.servico.reprovar(this.edicao, this.usuario, comentario)
})

When('tento enviar a edição', function () {
  this.resultado = this.servico.enviar(this.edicao)
})

Then('o comentário {string} deve ficar registrado na edição', function (comentario) {
  assert.equal(this.edicao.comentarioDeReprovacao, comentario)
})
