'use strict'

// Domínio do NewsFlow em memória. O foco do exercício é o encadeamento
// Gherkin -> step -> verificação, então não há banco, API nem relógio real.
//
// Regras implementadas até aqui:
//   RN01 (Rascunho)  - salvamento automático, versões numeradas, últimas 20
//   RN02 (Aprovação) - revisor aprova, autor não aprova a própria edição,
//                      reprovação devolve ao rascunho com comentário obrigatório
//   RN03 (Agendamento) - antecedência mínima de 15 min, até 2 reagendamentos,
//                        cancelamento até 5 min antes, fuso America/Sao_Paulo
//   RN04 (Segmentação) - no máximo 5 segmentos, segmento vazio bloqueia,
//                        quem está em dois segmentos recebe um único e-mail

const INTERVALO_SALVAMENTO_MS = 30 * 1000 // RN01: salva a cada 30 segundos
const MAXIMO_DE_VERSOES = 20 // RN01: mantém as últimas 20 versões

const MINUTO_MS = 60 * 1000
const FUSO = 'America/Sao_Paulo' // RN03: todo horário de envio é neste fuso
const ANTECEDENCIA_MINIMA_MS = 15 * MINUTO_MS // RN03: agendar 15 min à frente
const MAXIMO_DE_REAGENDAMENTOS = 2 // RN03
const PRAZO_PARA_CANCELAR_MS = 5 * MINUTO_MS // RN03: cancelar até 5 min antes
const MAXIMO_DE_SEGMENTOS = 5 // RN04

// Relógio falso: começa sempre no mesmo instante e só anda quando o teste manda.
// Assim nenhum cenário precisa de sleep nem depende da hora da máquina.
const INICIO_DO_RELOGIO = new Date('2026-03-09T09:00:00-03:00').getTime()

function resultado(ok, mensagem, extras = {}) {
  return { ok, mensagem, ...extras }
}

class Servico {
  constructor() {
    this.agoraMs = INICIO_DO_RELOGIO
    this.edicoes = []
    this.segmentos = new Map() // nome -> { nome, assinantes: Set<e-mail> }
    this.disparos = []
    this.entregas = [] // um registro por e-mail efetivamente entregue
  }

  // ---------------------------------------------------------------- relógio

  agora() {
    return new Date(this.agoraMs)
  }

  avancarRelogio(ms) {
    const destino = this.agoraMs + ms
    for (const edicao of this.edicoes) {
      // Cada edição tem seu próprio "alarme" de salvamento, a cada 30 segundos.
      while (edicao.proximoSalvamentoMs <= destino) {
        this._salvarSeHouveAlteracao(edicao, edicao.proximoSalvamentoMs)
        edicao.proximoSalvamentoMs += INTERVALO_SALVAMENTO_MS
      }
    }
    this.agoraMs = destino
    // Disparos agendados cujo horário chegou são executados (RN03 + RN04).
    for (const disparo of this.disparos) {
      if (disparo.estado === 'agendado' && disparo.horario.getTime() <= destino) {
        this._executarDisparo(disparo)
      }
    }
  }

  // ------------------------------------------------------- RN01: rascunho

  // Toda edição nasce como rascunho.
  criarEdicao(titulo, autor) {
    const edicao = {
      id: this.edicoes.length + 1,
      titulo,
      autor,
      corpo: '',
      estado: 'rascunho',
      versoes: [],
      ultimoNumeroDeVersao: 0,
      comentarioDeReprovacao: null,
      proximoSalvamentoMs: this.agoraMs + INTERVALO_SALVAMENTO_MS
    }
    this.edicoes.push(edicao)
    return edicao
  }

  editar(edicao, corpo) {
    edicao.corpo = corpo
  }

  restaurarVersao(edicao, numero) {
    const versao = edicao.versoes.find((v) => v.numero === numero)
    if (!versao) {
      return resultado(false, `A versão ${numero} não está mais disponível`)
    }
    // Restaurar só devolve o texto ao editor: as versões continuam todas lá.
    edicao.corpo = versao.corpo
    return resultado(true, `Versão ${numero} restaurada`)
  }

  _salvarSeHouveAlteracao(edicao, instanteMs) {
    const ultima = edicao.versoes[edicao.versoes.length - 1]
    const corpoSalvo = ultima ? ultima.corpo : ''
    if (edicao.corpo === corpoSalvo) return // nada mudou, nada a salvar

    edicao.ultimoNumeroDeVersao += 1
    edicao.versoes.push({
      numero: edicao.ultimoNumeroDeVersao,
      corpo: edicao.corpo,
      salvaEm: new Date(instanteMs)
    })
    while (edicao.versoes.length > MAXIMO_DE_VERSOES) {
      edicao.versoes.shift() // descarta a mais antiga
    }
  }

  // ------------------------------------------------------ RN02: aprovação

  solicitarRevisao(edicao) {
    this._exigirEstado(edicao, 'rascunho')
    edicao.estado = 'aguardando_revisao'
  }

  aprovar(edicao, revisor) {
    this._exigirEstado(edicao, 'aguardando_revisao')
    if (revisor.nome === edicao.autor.nome) {
      return resultado(false, 'O autor não pode aprovar a própria edição')
    }
    edicao.estado = 'aprovada'
    return resultado(true, 'Edição aprovada')
  }

  reprovar(edicao, revisor, comentario) {
    this._exigirEstado(edicao, 'aguardando_revisao')
    if (!comentario || comentario.trim() === '') {
      return resultado(false, 'O comentário é obrigatório para reprovar')
    }
    edicao.estado = 'rascunho'
    edicao.comentarioDeReprovacao = comentario
    return resultado(true, 'Edição devolvida ao rascunho')
  }

  // "Enviar ou agendar exige aprovação de um revisor." O agendamento (RN03)
  // aplica o mesmo portão em agendar(), mais abaixo.
  enviar(edicao) {
    if (edicao.estado !== 'aprovada') {
      return resultado(false, 'A edição precisa ser aprovada por um revisor antes do envio')
    }
    edicao.estado = 'enviada'
    return resultado(true, 'Edição enviada')
  }

  // ---------------------------------------------------- RN04: segmentação

  // Cria (ou completa) um segmento. Um assinante pode estar em vários.
  adicionarAoSegmento(nome, emails) {
    if (!this.segmentos.has(nome)) {
      this.segmentos.set(nome, { nome, assinantes: new Set() })
    }
    const segmento = this.segmentos.get(nome)
    for (const email of emails) segmento.assinantes.add(email)
    return segmento
  }

  _validarSegmentos(nomes) {
    if (nomes.length === 0) {
      return resultado(false, 'Escolha pelo menos um segmento')
    }
    if (nomes.length > MAXIMO_DE_SEGMENTOS) {
      return resultado(false, `Uma edição pode ir para no máximo ${MAXIMO_DE_SEGMENTOS} segmentos`)
    }
    for (const nome of nomes) {
      const segmento = this.segmentos.get(nome)
      if (!segmento) throw new Error(`Segmento inexistente no cenário: ${nome}`)
      if (segmento.assinantes.size === 0) {
        return resultado(false, `O segmento ${nome} não tem assinantes`)
      }
    }
    return null
  }

  // Une os assinantes de todos os segmentos: o Set elimina repetidos, então
  // quem está em dois segmentos recebe um único e-mail.
  _destinatarios(disparo) {
    const todos = new Set()
    for (const nome of disparo.segmentos) {
      for (const email of this.segmentos.get(nome).assinantes) todos.add(email)
    }
    return todos
  }

  _executarDisparo(disparo) {
    for (const email of this._destinatarios(disparo)) {
      this.entregas.push({ edicaoId: disparo.edicao.id, assinante: email, em: disparo.horario })
    }
    disparo.estado = 'enviado'
    disparo.edicao.estado = 'enviada'
  }

  entregasPara(email) {
    return this.entregas.filter((e) => e.assinante === email)
  }

  // ---------------------------------------------------- RN03: agendamento

  // "Enviar ou agendar exige aprovação de um revisor" (RN02) vale aqui também.
  agendar(edicao, nomesDosSegmentos, horario, gestor) {
    if (edicao.estado !== 'aprovada') {
      return resultado(false, 'A edição precisa ser aprovada por um revisor antes do envio')
    }
    if (this.disparos.some((d) => d.edicao === edicao && d.estado === 'agendado')) {
      return resultado(false, 'A edição já tem um envio agendado')
    }
    const problemaNosSegmentos = this._validarSegmentos(nomesDosSegmentos)
    if (problemaNosSegmentos) return problemaNosSegmentos
    if (!this._temAntecedenciaMinima(horario)) {
      return resultado(false, 'O envio precisa de ao menos 15 minutos')
    }

    const disparo = {
      id: this.disparos.length + 1,
      edicao,
      segmentos: [...nomesDosSegmentos],
      horario: new Date(horario.getTime()),
      fuso: FUSO,
      agendadoPor: gestor,
      reagendamentos: 0,
      estado: 'agendado'
    }
    this.disparos.push(disparo)
    return resultado(true, 'Envio agendado', { disparo })
  }

  reagendar(disparo, novoHorario) {
    if (disparo.estado !== 'agendado') {
      return resultado(false, 'Não há envio agendado para reagendar')
    }
    if (disparo.reagendamentos >= MAXIMO_DE_REAGENDAMENTOS) {
      return resultado(false, `O envio só pode ser reagendado ${MAXIMO_DE_REAGENDAMENTOS} vezes`)
    }
    if (!this._temAntecedenciaMinima(novoHorario)) {
      return resultado(false, 'O envio precisa de ao menos 15 minutos')
    }
    disparo.horario = new Date(novoHorario.getTime())
    disparo.reagendamentos += 1
    return resultado(true, 'Envio reagendado', { disparo })
  }

  cancelar(disparo) {
    if (disparo.estado !== 'agendado') {
      return resultado(false, 'Não há envio agendado para cancelar')
    }
    // "Até 5 minutos antes": faltando exatamente 5, ainda pode.
    if (disparo.horario.getTime() - this.agoraMs < PRAZO_PARA_CANCELAR_MS) {
      return resultado(false, 'O envio só pode ser cancelado até 5 minutos antes do horário marcado')
    }
    disparo.estado = 'cancelado'
    return resultado(true, 'Envio cancelado', { disparo })
  }

  // Exatamente 15 minutos à frente é aceito (>=), 14 não.
  _temAntecedenciaMinima(horario) {
    return horario.getTime() - this.agoraMs >= ANTECEDENCIA_MINIMA_MS
  }

  // Erro de programação (o teste montou um cenário impossível), não regra de negócio.
  _exigirEstado(edicao, esperado) {
    if (edicao.estado !== esperado) {
      throw new Error(`Esperava a edição em "${esperado}", mas ela está em "${edicao.estado}"`)
    }
  }
}

module.exports = Servico
