const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('node:assert/strict')

// US03 — Agendar envio (RN03)

Given('que agendei o envio para o segmento {string} daqui a {int} minutos', function (segmento, minutos) {
  this.agendarComoPreCondicao([segmento], minutos)
})

// Usa o próprio fluxo do sistema: cada reagendamento joga o envio 60 min à frente.
Given('que o envio já foi reagendado {int} vez\\(es)', function (vezes) {
  for (let i = 0; i < vezes; i++) {
    const r = this.servico.reagendar(this.disparo, this.daquiAMinutos(60))
    assert.ok(r.ok, `Pré-condição falhou ao reagendar: ${r.mensagem}`)
  }
})

// Avança o relógio falso até faltarem N minutos — sem sleep.
Given('que faltam {int} minutos para o horário do envio', function (faltam) {
  const ms = this.disparo.horario.getTime() - this.servico.agora().getTime() - faltam * 60 * 1000
  assert.ok(ms >= 0, `O envio já está a menos de ${faltam} minutos`)
  this.servico.avancarRelogio(ms)
})

When('agendo o envio para o segmento {string} daqui a {int} minutos', function (segmento, minutos) {
  this.resultado = this.servico.agendar(this.edicao, [segmento], this.daquiAMinutos(minutos), this.usuario)
  this.disparo = this.resultado.disparo || null
})

When('reagendo o envio para daqui a {int} minutos', function (minutos) {
  this.resultado = this.servico.reagendar(this.disparo, this.daquiAMinutos(minutos))
})

When('cancelo o envio', function () {
  this.resultado = this.servico.cancelar(this.disparo)
})

Then('o disparo deve estar agendado para {horario}, horário de Brasília', function (esperado) {
  assert.ok(this.disparo, 'Nenhum disparo foi agendado')
  assert.equal(this.disparo.estado, 'agendado')
  assert.equal(this.disparo.fuso, 'America/Sao_Paulo')
  assert.equal(this.disparo.horario.getTime(), esperado.getTime())
})

Then('o disparo deve estar {situacao}', function (situacao) {
  assert.equal(this.disparo.estado, situacao)
})
