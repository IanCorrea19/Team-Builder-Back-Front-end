import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AVATARES, cadastrar, entrar, listarPerfis } from '../perfis';
import type { Perfil } from '../perfis';

type Modo = 'entrar' | 'cadastrar';

const campo: React.CSSProperties = {
  width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db',
  boxSizing: 'border-box', outline: 'none', fontSize: '1rem',
};

export default function Login() {
  const navigate = useNavigate();
  const estado = (useLocation().state ?? {}) as { perfilId?: string; modo?: Modo };

  // Estados atualizados para o consumo assíncrono
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loadingInicial, setLoadingInicial] = useState(true); // Controla o loading do GET inicial
  
  const [modo, setModo] = useState<Modo>(estado.modo ?? 'entrar');
  const [perfilId, setPerfilId] = useState(estado.perfilId ?? '');
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState(AVATARES[0]);
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregandoSubmit, setCarregandoSubmit] = useState(false); // Controla o loading do botão

  // Consumo assíncrono de dados com fetch (exigência do professor)
  useEffect(() => {
    const carregarDadosDoServidor = async () => {
      try {
        const dadosServidor = await listarPerfis();
        setPerfis(dadosServidor);
        
        // Se veio do estado de navegação, mantém o modo, senão decide baseado nos dados
        if (!estado.modo) {
            setModo(dadosServidor.length > 0 ? 'entrar' : 'cadastrar');
        }
        // Se não tem perfilId selecionado, seleciona o primeiro
        if (!estado.perfilId && dadosServidor.length > 0) {
            setPerfilId(dadosServidor[0].id);
        }
      } catch (err) {
        setErro('Falha ao conectar com o Servidor Fastify.');
      } finally {
        setLoadingInicial(false);
      }
    };

    carregarDadosDoServidor();
  }, [estado.modo, estado.perfilId]);

  const perfilSel = perfis.find((p) => p.id === perfilId);

  const trocarModo = (m: Modo) => { setModo(m); setErro(''); setSenha(''); setConfirmar(''); };

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');
    setCarregandoSubmit(true);
    try {
      if (modo === 'entrar') {
        if (!perfilSel) throw new Error('Escolha um perfil para entrar.');
        if (!(await entrar(perfilSel.id, senha))) throw new Error('Senha incorreta.');
      } else {
        if (senha !== confirmar) throw new Error('As senhas não coincidem.');
        await cadastrar(nome, avatar, senha);
      }
      navigate('/equipe');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setCarregandoSubmit(false);
    }
  };

  const aba = (m: Modo, texto: string) => (
    <button type="button" onClick={() => trocarModo(m)}
      style={{ flex: 1, padding: '0.75rem', cursor: 'pointer', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '1rem',
        color: modo === m ? '#ef4444' : '#94a3b8', borderBottom: modo === m ? '3px solid #ef4444' : '3px solid #e2e8f0' }}>
      {texto}
    </button>
  );

  // Estado de loading tratado visualmente (exigência do professor)
  if (loadingInicial) {
      return (
          <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ color: '#5385cc' }}>Conectando ao banco de dados... 🛰️</h2>
          </div>
      );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '420px', width: '100%', borderTop: '8px solid #ef4444' }}>
        <h1 style={{ color: '#5385cc', margin: '0 0 0.5rem', fontSize: '1.8rem', textAlign: 'center' }}>Bem-vindo ao Laboratório!</h1>
        <p style={{ color: '#3b5b9c', marginBottom: '1.5rem', textAlign: 'center' }}>
          {modo === 'entrar' ? 'Escolha seu perfil para continuar.' : 'Crie um perfil de treinador para receber sua Pokédex.'}
        </p>

        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {aba('entrar', 'Entrar')}
          {aba('cadastrar', 'Criar perfil')}
        </div>

        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modo === 'entrar' ? (
            perfis.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhum perfil ainda. Crie o primeiro na aba "Criar perfil".</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                  {perfis.map((p) => (
                    <button key={p.id} type="button" onClick={() => { setPerfilId(p.id); setSenha(''); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.75rem', minWidth: '90px', cursor: 'pointer', borderRadius: '12px',
                        border: perfilId === p.id ? '3px solid #ef4444' : '3px solid #e2e8f0', backgroundColor: perfilId === p.id ? '#fee2e2' : 'white' }}>
                      <span style={{ fontSize: '2rem' }}>{p.avatar}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>{p.nome}</span>
                    </button>
                  ))}
                </div>
                {perfilSel?.senhaHash ? (
                  <input type="password" placeholder={`Senha de ${perfilSel.nome}`} value={senha} onChange={(e) => setSenha(e.target.value)} style={campo} autoFocus />
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Este perfil não tem senha. Você pode definir uma em Perfis.</p>
                )}
              </>
            )
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                {AVATARES.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => setAvatar(emoji)}
                    style={{ fontSize: '1.8rem', padding: '0.4rem', cursor: 'pointer', borderRadius: '50%', border: avatar === emoji ? '3px solid #ef4444' : '3px solid transparent', backgroundColor: avatar === emoji ? '#fee2e2' : 'transparent' }}>
                    {emoji}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Nome do treinador" value={nome} onChange={(e) => setNome(e.target.value)} style={campo} maxLength={20} />
              <input type="password" placeholder="Senha (mínimo 4 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} style={campo} />
              <input type="password" placeholder="Confirme a senha" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} style={campo} />
            </>
          )}

          {erro && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>{erro}</div>}

          {(modo === 'cadastrar' || perfis.length > 0) && (
            <button type="submit" disabled={carregandoSubmit}
              style={{ padding: '1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: carregandoSubmit ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem', opacity: carregandoSubmit ? 0.7 : 1 }}>
              {modo === 'entrar' ? 'Entrar' : 'Criar perfil e começar'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}