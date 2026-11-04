const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// US01 — Salvar rascunho automaticamente (RN01)

Given('que alterei o texto da edição para {string}', function (texto) {
  this.servico.editar(this.edicao, texto)
})

// Prepara o histórico usando o próprio fluxo do sistema: edita e deixa o
// salvamento automático (30 s) acontecer, uma vez por versão.
Given('que a edição já tem {int} versão/versões salva(s)', function (quantidade) {
  for (let i = 1; i <= quantidade; i++) {
    this.servico.editar(this.edicao, `Texto da versão ${i}`)
    this.avancarSegundos(30)
  }
  assert.equal(this.edicao.ultimoNumeroDeVersao, quantidade)
})

When('passam {int} segundos', function (segundos) {
  this.avancarSegundos(segundos)
})

When('restauro a versão {int}', function (numero) {
  this.resultado = this.servico.restaurarVersao(this.edicao, numero)
})

Then('a edição deve ter {int} versão/versões salva(s)', function (quantidade) {
  assert.equal(this.edicao.versoes.length, quantidade)
})

Then('a versão {int} deve ter o texto {string}', function (numero, texto) {
  const versao = this.edicao.versoes.find((v) => v.numero === numero)
  assert.ok(versao, `A versão ${numero} não existe`)
  assert.equal(versao.corpo, texto)
})

Then('a versão mais antiga mantida deve ser a de número {int}', function (numero) {
  assert.equal(this.edicao.versoes[0].numero, numero)
})

Then('o texto da edição deve ser o da versão {int}', function (numero) {
  const versao = this.edicao.versoes.find((v) => v.numero === numero)
  assert.ok(versao, `A versão ${numero} não existe`)
  assert.equal(this.edicao.corpo, versao.corpo)
})
