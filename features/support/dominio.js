'use strict'

// Domínio do NewsFlow em memória. O foco do exercício é o encadeamento
// Gherkin -> step -> verificação, então não há banco, API nem relógio real.
//
// Regras implementadas até aqui:
//   RN01 (Rascunho)  - salvamento automático, versões numeradas, últimas 20
//   RN02 (Aprovação) - revisor aprova, autor não aprova a própria edição,
//                      reprovação devolve ao rascunho com comentário obrigatório

const INTERVALO_SALVAMENTO_MS = 30 * 1000 // RN01: salva a cada 30 segundos
const MAXIMO_DE_VERSOES = 20 // RN01: mantém as últimas 20 versões

// Relógio falso: começa sempre no mesmo instante e só anda quando o teste manda.
// Assim nenhum cenário precisa de sleep nem depende da hora da máquina.
const INICIO_DO_RELOGIO = new Date('2026-03-09T09:00:00-03:00').getTime()

function resultado(ok, mensagem) {
  return { ok, mensagem }
}

class Servico {
  constructor() {
    this.agoraMs = INICIO_DO_RELOGIO
    this.edicoes = []
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

  // "Enviar ou agendar exige aprovação de um revisor." Aqui só o portão de
  // aprovação: o agendamento em si (RN03) ainda não faz parte deste escopo.
  enviar(edicao) {
    if (edicao.estado !== 'aprovada') {
      return resultado(false, 'A edição precisa ser aprovada por um revisor antes do envio')
    }
    edicao.estado = 'enviada'
    return resultado(true, 'Edição enviada')
  }

  // Erro de programação (o teste montou um cenário impossível), não regra de negócio.
  _exigirEstado(edicao, esperado) {
    if (edicao.estado !== esperado) {
      throw new Error(`Esperava a edição em "${esperado}", mas ela está em "${edicao.estado}"`)
    }
  }
}

module.exports = Servico
