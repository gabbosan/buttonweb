import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { mensagensLojista } from './mensagensReceber';
import io from 'socket.io-client';
import { startFaviconBlink, stopFaviconBlink, setFaviconFillNow } from './utils/faviconLayered';

const defaultUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || defaultUrl;
const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

function AppFornecedor() {
  useEffect(() => {
    document.body.classList.remove('pedir');
    document.body.classList.add('receber');
    return () => document.body.classList.remove('receber');
  }, []);

  useEffect(() => {
    document.title = 'FORNECEDOR - PEDIDOS';
  }, []);

  const [pedidos, setPedidos] = useState([]);
  const [camposMsg, setCamposMsg] = useState({});
  const [mensagens, setMensagens] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({ block: 'end' });
  }, [mensagens, pedidos]);

  useEffect(() => {
    socket.on('novo_pedido', (pedido) => {
      setPedidos((prev) => [...prev, pedido]);
    });
    return () => { socket.off('novo_pedido'); };
  }, []);

  useEffect(() => {
    socket.on('mensagem_comprador', (msg) => {
      const text = typeof msg === 'string' ? msg : (msg.text || String(msg));
      setMensagens((prev) => [...prev, { from: 'comprador', text }]);
      // flash favicon to notify fornecedor
      startFaviconBlink({ overlayPath: '/src/utils/ic_launcher_bat__round.png', fillColor: '#ffd600', interval: 500 });
      setTimeout(() => stopFaviconBlink(), 4000);
});
    return () => { socket.off('mensagem_comprador'); };
  }, []);

  const handleMensagemLojista = (msg) => {
    let texto = msg.texto;
    const lastPedido = pedidos && pedidos.length ? pedidos[pedidos.length - 1] : null;
    if (msg.campos) {
      msg.campos.forEach(campo => {
        let valor = (camposMsg[campo] || '').toString();
        if (campo === 'valor') {
          // remove labels e R$
          valor = valor.replace(/^\s*(?:valor\s+total|total|valor)\s*:\s*/i, '').replace(/^R\$\s*/i, '');
          // fallback para último pedido quando campo vazio
          if (!valor && lastPedido) valor = String(Number(lastPedido.total) || 0);
          // normalizar número
          const num = Number(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
          valor = `R$ ${num.toFixed(2).replace('.', ',')}`;
        }
        texto = texto.replace(`{${campo}}`, valor);
      });
    }
    socket.emit('mensagem_fornecedor', { texto, requerResposta: Boolean(msg.requerResposta) });
    setMensagens((prev) => [...prev, { from: 'fornecedor', text: texto }]);
  };

  return (
    <div className="receber-container">
      <div className="receber-header">
        <h1>BUTTON - FORNECEDOR</h1>
        <span>Pedidos</span>
      </div>
      <div className="receber-messages painel-branco">
        <div className="message bot" style={{background:'#fff', color:'#222'}}>
          <b style={{color:'#222'}}>Pedidos Recebidos:</b>
          {pedidos.length === 0 && <div style={{color:'#222'}}>Nenhum pedido ainda.</div>}
          {pedidos.map((pedido, idx) => (
            <div key={idx} style={{marginBottom:12,background:'#fff',padding:8,borderRadius:6}}>
              {pedido.itens.map((item, i) => (
                <div key={i} style={{paddingLeft:16, marginBottom:8}}>
                  {item.produtoNome}<br/>
                  {item.tamanho}<br/>
                  {item.quantidade}x {item.valorFormatado || `R$ ${Number(item.valor).toFixed(2).replace('.', ',')}`}<br/>
                  <b>R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}</b><br/>
                </div>
              ))}
              <div><b>Total: R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</b></div>
            </div>
          ))}
        </div>
        {mensagens.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from === 'fornecedor' ? 'fornecedor' : 'comprador'}`}>
            <b>{msg.from === 'fornecedor' ? 'Mensagem enviada' : 'Mensagem do comprador'}</b><br />
            {msg.text}
          </div>
        ))}
        <div ref={messagesRef} />
      </div>
      <div className="receber-composer">
        <b style={{color:'#222', display:'block', marginBottom:6}}>Mensagens prontas:</b>
        {mensagensLojista.map((msg, idx) => (
          <div key={msg.titulo} style={{marginBottom:8}}>
            <button className="receber-btn" style={{fontSize:14,padding:'6px 12px'}}
              onClick={() => handleMensagemLojista(msg)}>{msg.titulo}</button>
            {msg.campos && msg.campos.map(campo => (
              <input
                key={campo}
                name={campo}
                id={campo}
                placeholder={campo}
                style={{marginLeft:8,marginRight:4,padding:'2px 6px',fontSize:14}}
                value={camposMsg[campo]||''}
                onChange={e=>setCamposMsg({...camposMsg,[campo]:e.target.value})}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppFornecedor;
