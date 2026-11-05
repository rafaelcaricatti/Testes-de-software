# language: pt
Funcionalidade: Enviar a edição só para os segmentos escolhidos
  Como gestora de comunicação
  Quero escolher para quais segmentos de assinantes a edição vai
  Para que cada público receba só o que interessa, sem e-mail repetido

  Contexto:
    Dado que a redatora "Ana" criou a edição "Informativo #42"
    E que a edição está aprovada
    E que estou autenticada como gestora "Carla"

  @feliz
  Cenário: Quem está em dois segmentos recebe um único e-mail
    Dado que os segmentos têm os seguintes assinantes:
      | segmento         | assinante         |
      | Clientes Premium | bruno@exemplo.com |
      | Clientes Premium | carla@exemplo.com |
      | Belo Horizonte   | carla@exemplo.com |
      | Belo Horizonte   | diego@exemplo.com |
      | Estudantes       | eva@exemplo.com   |
    E que agendei o envio para os segmentos "Clientes Premium" e "Belo Horizonte" daqui a 30 minutos
    Quando chega o horário do envio
    Então devem ser entregues 3 e-mails da edição
    E "carla@exemplo.com" deve receber 1 e-mail
    E "eva@exemplo.com" não deve receber nenhum e-mail

  @excecao
  Cenário: Segmento sem assinantes bloqueia o agendamento
    Dado que o segmento "Clientes Premium" tem 1200 assinantes
    E que o segmento "Interior de MG" tem 0 assinantes
    Quando agendo o envio para os segmentos "Clientes Premium" e "Interior de MG" daqui a 30 minutos
    Então devo ver a mensagem "O segmento Interior de MG não tem assinantes"
    E nenhum envio deve ficar agendado

  @limite
  Esquema do Cenário: No máximo 5 segmentos por edição
    Dado que existem <quantidade> segmentos com 100 assinantes cada
    Quando agendo o envio para os <quantidade> segmentos daqui a 30 minutos
    Então devo ver a mensagem "<mensagem>"

    Exemplos:
      | quantidade | mensagem                                      |
      | 4          | Envio agendado                                |
      | 5          | Envio agendado                                |
      | 6          | Uma edição pode ir para no máximo 5 segmentos |
