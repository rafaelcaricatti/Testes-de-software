const { setWorldConstructor } = require('@cucumber/cucumber')
const Servico = require('./dominio')

// O World é a "memória" de UM cenário: o Cucumber cria um novo antes de cada
// cenário, então nada vaza de um para outro. Dentro dos steps, ele é o `this`.
class MundoDoNewsFlow {
  constructor() {
    this.servico = new Servico() // domínio novo (e relógio zerado) a cada cenário
    this.usuario = null // quem está "logado" no cenário
    this.edicao = null // a edição com que o cenário trabalha
    this.resultado = null // retorno da última ação (ok + mensagem)
  }

  avancarSegundos(segundos) {
    this.servico.avancarRelogio(segundos * 1000)
  }

  // Leva a edição ao estado desejado usando só ações reais do domínio.
  levarEdicaoPara(estado) {
    if (estado === 'rascunho') return
    this.servico.solicitarRevisao(this.edicao)
    if (estado === 'aguardando_revisao') return
    if (estado === 'aprovada') {
      this.servico.aprovar(this.edicao, { nome: 'Revisor da casa', papel: 'revisor' })
      return
    }
    throw new Error(`Estado desconhecido: ${estado}`)
  }
}

setWorldConstructor(MundoDoNewsFlow)
