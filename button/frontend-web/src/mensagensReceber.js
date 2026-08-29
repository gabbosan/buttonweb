// Mensagens prontas para o receber usar no atendimento
export const mensagensLojista = [
  {
    titulo: 'Pedido Confirmado',
    texto: 'Pedido confirmado!\n\nValor total: R$ {valor}.\n\nFormas de pagamento:\n- Pix\n- Cartão na retirada\n- Dinheiro',
    campos: ['valor'],
    requerResposta: true
  },
  {
    titulo: 'Chave Pix',
    texto: 'Chave Pix para pagamento: {chavePix}',
    campos: ['chavePix']
  },
  {
    titulo: 'Aguardando comprovante',
    texto: 'Por favor, envie o comprovante do pagamento para prosseguir.'
  },
  {
    titulo: 'Tempo de preparo',
    texto: 'Tempo estimado para retirada/entrega: {tempo}',
    campos: ['tempo']
  },
  {
    titulo: 'Pedido pronto',
    texto: 'Seu pedido está pronto! Pode retirar na receber ou aguardar a entrega. Obrigado!'
  }
];
