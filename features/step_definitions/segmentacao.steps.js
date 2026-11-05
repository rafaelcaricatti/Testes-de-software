const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// US04 — Enviar a edição só para os segmentos escolhidos (RN04)

Given('que os segmentos têm os seguintes assinantes:', function (tabela) {
  for (const { segmento, assinante } of tabela.hashes()) {
    this.servico.adicionarAoSegmento(segmento, [assinante])
  }
})

Given('que existem {int} segmentos com {int} assinantes cada', function (quantidade, assinantes) {
  for (let s = 1; s <= quantidade; s++) {
    const emails = Array.from({ length: assinantes }, (_, i) => `seg${s}-${i + 1}@exemplo.com`)
    this.servico.adicionarAoSegmento(`Segmento ${s}`, emails)
  }
})

Given(
  'que agendei o envio para os segmentos {string} e {string} daqui a {int} minutos',
  function (primeiro, segundo, minutos) {
    this.agendarComoPreCondicao([primeiro, segundo], minutos)
  }
)

When(
  'agendo o envio para os segmentos {string} e {string} daqui a {int} minutos',
  function (primeiro, segundo, minutos) {
    this.resultado = this.servico.agendar(this.edicao, [primeiro, segundo], this.daquiAMinutos(minutos), this.usuario)
    this.disparo = this.resultado.disparo || null
  }
)

// Escolhe todos os segmentos criados no cenário (o Dado anterior cria exatamente N).
When('agendo o envio para os {int} segmentos daqui a {int} minutos', function (quantidade, minutos) {
  const nomes = [...this.servico.segmentos.keys()]
  assert.equal(nomes.length, quantidade, 'O cenário deveria ter criado exatamente esses segmentos')
  this.resultado = this.servico.agendar(this.edicao, nomes, this.daquiAMinutos(minutos), this.usuario)
  this.disparo = this.resultado.disparo || null
})

When('chega o horário do envio', function () {
  const ms = this.disparo.horario.getTime() - this.servico.agora().getTime()
  this.servico.avancarRelogio(ms)
})

Then('devem ser entregues {int} e-mails da edição', function (quantidade) {
  const daEdicao = this.servico.entregas.filter((e) => e.edicaoId === this.edicao.id)
  assert.equal(daEdicao.length, quantidade)
})

Then('{string} deve receber {int} e-mail(s)', function (email, quantidade) {
  assert.equal(this.servico.entregasPara(email).length, quantidade)
})

Then('{string} não deve receber nenhum e-mail', function (email) {
  assert.equal(this.servico.entregasPara(email).length, 0)
})

Then('nenhum envio deve ficar agendado', function () {
  const agendados = this.servico.disparos.filter((d) => d.estado === 'agendado')
  assert.equal(agendados.length, 0)
})
