import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATARES, MAX_EQUIPE, atualizarPerfil, excluirPerfil, getPerfilAtivo, lerEquipe, listarPerfis, sair } from '../perfis';
import type { Membro, Perfil } from '../perfis';

const campo = { padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', width: '100%', boxSizing: 'border-box' as const };
const botao = (cor: string, cheio = false) => ({
  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const,
  border: `1px solid ${cor}`, backgroundColor: cheio ? cor : 'transparent', color: cheio ? 'white' : cor,
});

export default function Perfis() {
  const navigate = useNavigate();
  const [ativo, setAtivo] = useState<Perfil | null>(getPerfilAtivo());
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [equipes, setEquipes] = useState<Record<string, Membro[]>>({});
  const [loading, setLoading] = useState(true);

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // Segurança de navegação
  useEffect(() => { 
    if (!ativo) navigate('/'); 
  }, [ativo, navigate]);

  // Função assíncrona para buscar todos os perfis e as suas respetivas equipas no servidor
  const recarregar = async () => {
    setLoading(true);
    try {
      const listaPerfis = await listarPerfis();
      setPerfis(listaPerfis);
      
      const mapaEquipes: Record<string, Membro[]> = {};
      // Como o lerEquipe agora é uma Promise, aguardamos as respostas do servidor
      for (const p of listaPerfis) {
        mapaEquipes[p.id] = await lerEquipe(p.id);
      }
      setEquipes(mapaEquipes);
      setAtivo(getPerfilAtivo());
    } catch (e) {
      console.error("Erro ao carregar dados do servidor:", e);
    } finally {
      setLoading(false);
    }
  };

  // Chama a função assíncrona quando o componente monta
  useEffect(() => {
    if (ativo) {
      recarregar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ativo) return null;

  const iniciarEdicao = () => { setNome(ativo.nome); setAvatar(ativo.avatar); setSenha(''); setErro(''); setEditando(true); };

  const salvar = async () => {
    try {
      await atualizarPerfil(ativo.id, { nome, avatar, senha: senha || undefined });
      setEditando(false);
      await recarregar(); // Recarrega os dados do servidor após edição
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  const excluir = async () => {
    if (window.confirm(`Excluir o perfil "${ativo.nome}" e toda a equipe dele? Esta ação não pode ser desfeita.`)) {
      await excluirPerfil(ativo.id); // Aguarda exclusão no Fastify
      navigate('/');
    }
  };

  const trocar = (id: string) => navigate('/', { state: { perfilId: id } });

  // Loading visual exigido pelo professor
  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>A sincronizar perfis com o Servidor Fastify... 📡</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Perfis de treinador</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navigate('/', { state: { modo: 'cadastrar' } })} style={botao('#10b981', true)}>+ Novo perfil</button>
          <button onClick={() => { sair(); navigate('/'); }} style={botao('#64748b')}>Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {perfis.map((p) => {
          const equipe = equipes[p.id] || [];
          const ehAtivo = p.id === ativo.id;
          return (
            <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem', border: ehAtivo ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '2.5rem' }}>{p.avatar}</div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <strong style={{ fontSize: '1.2rem' }}>{p.nome}</strong>
                  {ehAtivo && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', backgroundColor: '#ef4444', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>Ativo</span>}
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Equipe: {equipe.length} / {MAX_EQUIPE} · {p.senhaHash ? 'Protegido por senha' : 'Sem senha'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {ehAtivo ? (
                    <>
                      <button onClick={() => navigate('/equipe')} style={botao('#ef4444', true)}>Editar equipe</button>
                      <button onClick={iniciarEdicao} style={botao('#3b82f6')}>Editar perfil</button>
                      <button onClick={excluir} style={botao('#b91c1c')}>Excluir</button>
                    </>
                  ) : (
                    <button onClick={() => trocar(p.id)} style={botao('#ef4444')}>Trocar para este perfil</button>
                  )}
                </div>
              </div>

              {equipe.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
                  {equipe.map((m) => <img key={m.id} src={m.imagem} alt={m.nome} title={m.nome} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />)}
                </div>
              )}

              {ehAtivo && editando && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {AVATARES.map((emoji) => (
                      <button key={emoji} onClick={() => setAvatar(emoji)}
                        style={{ fontSize: '1.6rem', padding: '0.3rem', cursor: 'pointer', borderRadius: '50%', border: avatar === emoji ? '3px solid #ef4444' : '3px solid transparent', backgroundColor: avatar === emoji ? '#fee2e2' : 'transparent' }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do treinador" maxLength={20} style={campo} />
                  <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Nova senha (deixe em branco para manter)" style={campo} />
                  {erro && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.6rem', borderRadius: '6px', fontSize: '0.9rem' }}>{erro}</div>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={salvar} style={botao('#10b981', true)}>Salvar alterações</button>
                    <button onClick={() => setEditando(false)} style={botao('#64748b')}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}