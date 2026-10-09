import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MAX_EQUIPE, getPerfilAtivo, lerEquipe, salvarEquipe } from '../perfis';
import type { Membro, Perfil } from '../perfis';

const btnPequeno = { padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: 'white', color: '#ef4444', fontWeight: 'bold' as const };

export default function Equipe() {
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true); // Estado de loading exigido
  const navigate = useNavigate();

  // Consumo assíncrono com useEffect e await
  useEffect(() => {
    const carregarEquipe = async () => {
      const ativo = getPerfilAtivo();
      if (!ativo) { 
        navigate('/'); 
        return; 
      }
      
      setPerfil(ativo);
      try {
        // Agora aguarda o fetch do Fastify
        const dadosEquipe = await lerEquipe(ativo.id);
        setEquipe(dadosEquipe);
      } catch (error) {
        console.error("Falha ao carregar equipe:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarEquipe();
  }, [navigate]);

  const atualizar = async (nova: Membro[]) => {
    if (!perfil) return;
    setEquipe(nova); // Atualiza visualmente logo de imediato
    try {
      await salvarEquipe(perfil.id, nova); // Salva no Fastify em background
    } catch (error) {
      alert("Erro de conexão ao tentar salvar a equipa no servidor.");
    }
  };

  const libertar = (id: number) => atualizar(equipe.filter((p) => p.id !== id));

  const mover = (i: number, direcao: -1 | 1) => {
    const j = i + direcao;
    if (j < 0 || j >= equipe.length) return;
    const nova = [...equipe];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    atualizar(nova);
  };

  const limparEquipe = () => {
    if (window.confirm('Libertar todos os Pokémon da equipe?')) atualizar([]);
  };

  // Feedback visual durante o carregamento
  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>A carregar a sua equipa do Laboratório... 🔄</h2>
      </div>
    );
  }

  if (!perfil) return null;

  const slots = Array.from({ length: MAX_EQUIPE });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', backgroundColor: '#ef4444', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: 'inset 0px 4px 4px rgba(0,0,0,0.1)' }}>
          {perfil.avatar}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '2.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            Equipe de {perfil.nome}
          </h2>
          <p style={{ margin: 0, color: '#fef2f2', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Capacidade: {equipe.length} / {MAX_EQUIPE}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/perfis" style={{ padding: '0.6rem 1rem', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Gerenciar perfis</Link>
          {equipe.length > 0 && (
            <button onClick={limparEquipe} style={{ padding: '0.6rem 1rem', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Limpar equipe</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {slots.map((_, index) => {
          const membro = equipe[index];

          if (membro) {
            return (
              <div key={membro.id} style={{ border: '2px solid #ef4444', borderRadius: '12px', padding: '1rem', backgroundColor: '#fef2f2', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <button onClick={() => mover(index, -1)} disabled={index === 0} title="Mover para antes" style={{ ...btnPequeno, opacity: index === 0 ? 0.3 : 1 }}>◀</button>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', alignSelf: 'center' }}>Posição {index + 1}</span>
                  <button onClick={() => mover(index, 1)} disabled={index === equipe.length - 1} title="Mover para depois" style={{ ...btnPequeno, opacity: index === equipe.length - 1 ? 0.3 : 1 }}>▶</button>
                </div>
                <Link to={`/pokemon/${membro.id}`}>
                  <img src={membro.imagem} alt={membro.nome} style={{ height: '120px', objectFit: 'contain' }} />
                </Link>
                <h4 style={{ textTransform: 'capitalize', fontSize: '1.2rem', margin: '0.5rem 0' }}>{membro.nome}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {membro.tipos.map((t) => (
                    <span key={t} style={{ fontSize: '0.7rem', backgroundColor: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', textTransform: 'uppercase' }}>{t}</span>
                  ))}
                </div>
                <button onClick={() => libertar(membro.id)} style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Libertar
                </button>
              </div>
            );
          }

          return (
            <div key={`vazio-${index}`} style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #cbd5e1', opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8', margin: '0 0 1rem 0' }}>Slot vazio</p>
              <Link to="/pokedex" style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem' }}>
                Procurar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}