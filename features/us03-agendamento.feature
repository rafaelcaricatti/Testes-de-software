# language: pt
Funcionalidade: Agendar envio de newsletter
  Como gestora de comunicação
  Quero agendar, reagendar ou cancelar o envio de uma edição aprovada
  Para que ela chegue no melhor horário sem eu precisar apertar o botão na hora

  Contexto:
    Dado que a redatora "Ana" criou a edição "Informativo #42"
    E que a edição está aprovada
    E que o segmento "Clientes Premium" tem 1200 assinantes
    E que estou autenticada como gestora "Carla"

  @feliz
  Cenário: Agendamento com antecedência suficiente
    Quando agendo o envio para o segmento "Clientes Premium" daqui a 30 minutos
    Então o disparo deve estar agendado para 09/03/2026 às 09h30, horário de Brasília
    E devo ver a mensagem "Envio agendado"

  @limite
  Esquema do Cenário: Antecedência mínima de 15 minutos para agendar
    Quando agendo o envio para o segmento "Clientes Premium" daqui a <minutos> minutos
    Então devo ver a mensagem "<mensagem>"

    Exemplos:
      | minutos | mensagem                               |
      | 60      | Envio agendado                         |
      | 16      | Envio agendado                         |
      | 15      | Envio agendado                         |
      | 14      | O envio precisa de ao menos 15 minutos |
      | 0       | O envio precisa de ao menos 15 minutos |

  @feliz
  Cenário: Reagendar muda o horário do disparo
    Dado que agendei o envio para o segmento "Clientes Premium" daqui a 30 minutos
    Quando reagendo o envio para daqui a 90 minutos
    Então o disparo deve estar agendado para 09/03/2026 às 10h30, horário de Brasília
    E devo ver a mensagem "Envio reagendado"

  @limite
  Esquema do Cenário: No máximo 2 reagendamentos
    Dado que agendei o envio para o segmento "Clientes Premium" daqui a 30 minutos
    E que o envio já foi reagendado <vezes> vez(es)
    Quando reagendo o envio para daqui a 60 minutos
    Então devo ver a mensagem "<mensagem>"

    Exemplos:
      | vezes | mensagem                               |
      | 0     | Envio reagendado                       |
      | 1     | Envio reagendado                       |
      | 2     | O envio só pode ser reagendado 2 vezes |

  @limite
  Esquema do Cenário: Cancelamento até 5 minutos antes do horário marcado
    Dado que agendei o envio para o segmento "Clientes Premium" daqui a 30 minutos
    E que faltam <faltam> minutos para o horário do envio
    Quando cancelo o envio
    Então devo ver a mensagem "<mensagem>"
    E o disparo deve estar <situacao>

    Exemplos:
      | faltam | situacao  | mensagem                                                              |
      | 6      | cancelado | Envio cancelado                                                       |
      | 5      | cancelado | Envio cancelado                                                       |
      | 4      | agendado  | O envio só pode ser cancelado até 5 minutos antes do horário marcado |
