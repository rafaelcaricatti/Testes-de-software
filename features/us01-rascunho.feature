# language: pt
Funcionalidade: Salvar rascunho automaticamente
  Como redatora
  Quero que meu texto seja salvo enquanto escrevo
  Para não perder trabalho quando a conexão cair

  Contexto:
    Dado que a redatora "Ana" criou a edição "Informativo #42"

  @feliz
  Cenário: Salvamento automático após 30 segundos
    Dado que alterei o texto da edição para "Olá, assinantes!"
    Quando passam 30 segundos
    Então a edição deve ter 1 versão salva
    E a versão 1 deve ter o texto "Olá, assinantes!"
    E a edição deve estar em rascunho

  @excecao
  Cenário: Sem alteração no texto não gera versão
    Quando passam 30 segundos
    Então a edição deve ter 0 versões salvas

  @excecao
  Cenário: Antes de 30 segundos nada é salvo
    Dado que alterei o texto da edição para "Olá, assinantes!"
    Quando passam 29 segundos
    Então a edição deve ter 0 versões salvas

  @limite
  Esquema do Cenário: Apenas as últimas 20 versões são mantidas
    Dado que a edição já tem <salvas> versões salvas
    E que alterei o texto da edição para "Texto novo"
    Quando passam 30 segundos
    Então a edição deve ter <mantidas> versões salvas
    E a versão mais antiga mantida deve ser a de número <mais_antiga>

    Exemplos:
      | salvas | mantidas | mais_antiga |
      | 0      | 1        | 1           |
      | 19     | 20       | 1           |
      | 20     | 20       | 2           |
      | 25     | 20       | 7           |

  @feliz
  Cenário: Restaurar uma versão não apaga as demais
    Dado que a edição já tem 3 versões salvas
    Quando restauro a versão 2
    Então o texto da edição deve ser o da versão 2
    E a edição deve ter 3 versões salvas

  @excecao
  Cenário: Versão fora das últimas 20 não pode ser restaurada
    Dado que a edição já tem 21 versões salvas
    Quando restauro a versão 1
    Então devo ver a mensagem "A versão 1 não está mais disponível"
