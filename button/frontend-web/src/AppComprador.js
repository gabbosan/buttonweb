import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { catalogo } from './catalogo';
import io from 'socket.io-client';

const defaultUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
const socketUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || defaultUrl;
const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

function AppComprador() {
  useEffect(() => {
    document.body.classList.remove('receber');
    document.body.classList.add('pedir');
    return () => document.body.classList.remove('pedir');
  }, []);

  useEffect(() => {
    document.title = 'BUTTON - CATÁLOGO';
  }, []);

  const [selecoes, setSelecoes] = useState({});
  const [etapa, setEtapa] = useState('catalogo');
  const [resumo, setResumo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [resposta, setResposta] = useState('');
  const [devolverResposta, setDevolverResposta] = useState(false);
  const [respostaAtiva, setRespostaAtiva] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({ block: 'end' });
  }, [mensagens, etapa, resumo]);

  const handleSelect = (produto, tipo, quantidade) => {
    setSelecoes((prev) => ({
      ...prev,
      [produto]: {
        ...prev[produto],
        [tipo]: quantidade
      }
    }));
  };

  const parseValor = (op) => {
    if (op.valor != null) return Number(op.valor);
    if (op.valorFormatado) return Number(String(op.valorFormatado).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    return 0;
  };

  const padUnidade = (u) => {
    if (!u) return '';
    const num = String(u).padStart(2, '0');
    return `${num}un`;
  };

  const handleEnviar = () => {
    const itens = [];
    let total = 0;

    catalogo.forEach(prod => {
      (prod.opcoes || []).forEach(op => {
        const qtd = selecoes[prod.nome]?.[op.tipo] || 0;
        if (qtd > 0) {
          const valorNum = parseValor(op);
          itens.push({
            produtoNome: prod.nome,
            varianteTipo: op.tipo,
            modelo: op.modelo || '',
            tamanho: op.tamanho || '',
            cor: op.cor || '',
            unidade: op.unidade || '',
            valor: valorNum,
            valorFormatado: op.valorFormatado || null,
            quantidade: qtd,
            subtotal: valorNum * qtd
          });
          total += valorNum * qtd;
        }
      });
    });

    setResumo({ itens, total });
    setEtapa('resumo');
  };

  const handleConfirmar = () => {
    socket.emit('novo_pedido', resumo);
    setMensagens((prev) => [...prev, { from: 'pedir', text: 'Pedido enviado para fornecedor.' }]);
    setEtapa('aguardando');
  };

  const handleEnviarResposta = () => {
    const texto = resposta.trim();
    if (!texto || !devolverResposta) return;
    socket.emit('mensagem_comprador', texto);
    setMensagens((prev) => [...prev, { from: 'comprador', text: texto }]);
    setResposta('');
    setDevolverResposta(false);
    setRespostaAtiva(false);
  };

  useEffect(() => {
    socket.on('mensagem_fornecedor', (msg) => {
      const texto = typeof msg === 'string' ? msg : msg.texto;
      setMensagens((prev) => [...prev, { from: 'fornecedor', text: texto }]);
      setRespostaAtiva(typeof msg !== 'string' && msg.requerResposta === true);
    });
    return () => { socket.off('mensagem_fornecedor'); };
  }, []);

  return (
    <div className="pedir-container">
      <div className="pedir-header">
        <h1>BUTTON - PEDIR</h1>
        <span>Catálogo</span>
      </div>

      <div className="pedir-messages">
        {etapa === 'catalogo' && (
          <>
            <div className="message bot"><b>Olá!</b> Selecione seu pedido:</div>
            {catalogo.map((prod) => (
              <div key={prod.nome} className="catalogo-produto">
                <b>{prod.nome.toUpperCase()}</b>
                {(prod.opcoes || []).map((op) => (
                  <div key={op.tipo} className="catalogo-opcao" style={{ marginBottom: 22 }}>
                    <div>
                      <div>{op.modelo ? `${op.modelo} • ` : ''}{op.tamanho} • {op.cor || ''}</div>
                      <div style={{ fontWeight: 'bold' }}>{op.valorFormatado || (parseValor(op) ? `R$ ${parseValor(op).toFixed(2).replace('.', ',')}` : '')}</div>
                      <div style={{ color: '#666' }}>{padUnidade(op.unidade)}</div>
                    </div>

                    <div style={{ height: 8 }} />
                    <div className="radio-group" style={{ marginBottom: 8 }}>
                      {[1,2,3].map(qtd => (
                        <label key={qtd} className="radio-label">
                          <input
                            type="radio"
                            name={`${prod.nome}-${op.tipo}`}
                            checked={(selecoes[prod.nome]?.[op.tipo] || 0) === qtd}
                            onChange={() => handleSelect(prod.nome, op.tipo, qtd)}
                          />
                          <span className="radio-custom" />
                          {qtd}u
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button className="enviar-btn" onClick={handleEnviar} style={{ marginTop: 16 }}>ENVIAR</button>
          </>
        )}

        {etapa === 'resumo' && (
          <div className="message bot">
            <b>Resumo do Pedido:</b>
            <div style={{ margin: '10px 0' }}>
              {resumo?.itens.map((item, idx) => (
                <div key={idx} style={{ paddingLeft: 16, marginBottom: 8 }}>
                  {item.produtoNome}<br/>
                  {item.modelo && <>{item.modelo} • </>}{item.tamanho} • {item.cor}<br/>
                  {item.quantidade}x {item.valorFormatado || `R$ ${item.valor.toFixed(2).replace('.', ',')}`}<br/>
                  <b>R$ {item.subtotal.toFixed(2).replace('.', ',')}</b><br/>
                </div>
              ))}
            </div>
            <div><b>Total: R$ {resumo?.total.toFixed(2).replace('.', ',')}</b></div>
            <button className="enviar-btn" onClick={handleConfirmar} style={{ marginTop: 16, marginRight: 8 }}>CONFIRMAR</button>
          </div>
        )}

        {etapa === 'aguardando' && (
          <div className="message bot">
            <b>Pedido enviado ao fornecedor.</b><br/>Aguarde a resposta.
          </div>
        )}

        {mensagens.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from === 'fornecedor' ? 'fornecedor' : 'user'}`}>
            {msg.from === 'fornecedor' && <b>Resposta da loja</b>}
            {msg.from === 'fornecedor' && <br />}
            {msg.text}
          </div>
        ))}
        <div ref={messagesRef} />
      </div>
      {respostaAtiva && (
        <div className="resposta-comprador">
          <label>
            <input
              type="checkbox"
              checked={devolverResposta}
              onChange={(event) => setDevolverResposta(event.target.checked)}
            />
            Devolver resposta ao lojista
          </label>
          <input
            value={resposta}
            onChange={(event) => setResposta(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleEnviarResposta()}
            placeholder="Responder à loja"
          />
          <button type="button" onClick={handleEnviarResposta} disabled={!devolverResposta}>ENVIAR</button>
        </div>
      )}
    </div>
  );
}

export default AppComprador;
