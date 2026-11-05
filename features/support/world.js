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
    this.disparo = null // o envio agendado com que o cenário trabalha (US03/US04)
  }

  // "Daqui a N minutos" sempre a partir do relógio falso do domínio.
  daquiAMinutos(minutos) {
    return new Date(this.servico.agora().getTime() + minutos * 60 * 1000)
  }

  // Agenda como pré-condição (Dado): se falhar, o cenário foi mal montado.
  agendarComoPreCondicao(segmentos, minutos) {
    const r = this.servico.agendar(this.edicao, segmentos, this.daquiAMinutos(minutos), this.usuario)
    if (!r.ok) throw new Error(`Pré-condição falhou ao agendar: ${r.mensagem}`)
    this.disparo = r.disparo
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
