# language: pt
Funcionalidade: Aprovar a edição antes do envio
  Como revisora
  Quero aprovar ou reprovar as edições escritas por outras pessoas
  Para que nenhum erro de conteúdo chegue aos 40 mil assinantes

  Contexto:
    Dado que a redatora "Ana" criou a edição "Informativo #42"

  @feliz
  Cenário: Revisora aprova a edição de outra pessoa
    Dado que a edição está aguardando revisão
    E que estou autenticada como revisora "Beatriz"
    Quando aprovo a edição
    Então a edição deve estar aprovada
    E devo ver a mensagem "Edição aprovada"

  @excecao
  Cenário: Autora não aprova a própria edição
    Dado que a edição está aguardando revisão
    E que estou autenticada como revisora "Ana"
    Quando aprovo a edição
    Então devo ver a mensagem "O autor não pode aprovar a própria edição"
    E a edição deve estar aguardando revisão

  @alternativo
  Cenário: Reprovação devolve a edição ao rascunho com o comentário
    Dado que a edição está aguardando revisão
    E que estou autenticada como revisora "Beatriz"
    Quando reprovo a edição com o comentário "Faltou a imagem de capa"
    Então a edição deve estar em rascunho
    E o comentário "Faltou a imagem de capa" deve ficar registrado na edição
    E devo ver a mensagem "Edição devolvida ao rascunho"

  @excecao
  Cenário: Reprovação sem comentário é recusada
    Dado que a edição está aguardando revisão
    E que estou autenticada como revisora "Beatriz"
    Quando reprovo a edição com o comentário ""
    Então devo ver a mensagem "O comentário é obrigatório para reprovar"
    E a edição deve estar aguardando revisão

  @limite
  Esquema do Cenário: Só uma edição aprovada pode ser enviada
    Dado que a edição está <estado>
    Quando tento enviar a edição
    Então devo ver a mensagem "<mensagem>"

    Exemplos:
      | estado             | mensagem                                                    |
      | em rascunho        | A edição precisa ser aprovada por um revisor antes do envio |
      | aguardando revisão | A edição precisa ser aprovada por um revisor antes do envio |
      | aprovada           | Edição enviada                                              |
