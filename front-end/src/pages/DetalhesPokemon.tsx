import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MAX_EQUIPE, getPerfilAtivo, lerEquipe, salvarEquipe } from '../perfis';
import type { Membro } from '../perfis';

export default function DetalhesPokemon() {
  const { name } = useParams();
  const navigate = useNavigate();
  
  // Estados do Pokémon
  const [pokemon, setPokemon] = useState<any>(null);
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  
  // Estados da Equipa (Assíncrono)
  const perfil = getPerfilAtivo();
  const [equipeAtual, setEquipeAtual] = useState<Membro[]>([]);
  const [loadingEquipe, setLoadingEquipe] = useState(!!perfil);
  const [salvando, setSalvando] = useState(false);
  
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  // 1. Busca os dados do Pokémon na PokéAPI
  useEffect(() => {
    const buscarDetalhes = async () => {
      setLoadingPokemon(true);
      setErro('');
      setAviso('');
      try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!resposta.ok) throw new Error('Erro ao carregar dados do Pokémon.');
        setPokemon(await resposta.json());
      } catch (err) {
        setErro('Falha na conexão com a PokéAPI.');
      } finally {
        setLoadingPokemon(false);
      }
    };
    buscarDetalhes();
  }, [name]);

  // 2. Busca a equipa atual do utilizador no Fastify
  useEffect(() => {
    const carregarEquipe = async () => {
      if (perfil) {
        try {
          const eq = await lerEquipe(perfil.id);
          setEquipeAtual(eq);
        } catch (e) {
          console.error("Erro ao ler equipa do servidor", e);
        } finally {
          setLoadingEquipe(false);
        }
      }
    };
    carregarEquipe();
  }, [perfil?.id]);

  const jaNaEquipe = !!pokemon && equipeAtual.some((p) => p.id === pokemon.id);

  const capturarParaEquipe = async () => {
    if (!perfil) {
      navigate('/');
      return;
    }

    if (equipeAtual.length >= MAX_EQUIPE) {
      setAviso(`Sua equipe já tem ${MAX_EQUIPE} Pokémon. Liberte algum na página da equipe antes de adicionar outro.`);
      return;
    }

    if (jaNaEquipe) {
      setAviso('Este Pokémon já está na sua equipe.');
      return;
    }

    setSalvando(true);
    setAviso('');

    try {
      const novaEquipe = [
        ...equipeAtual,
        {
          id: pokemon.id,
          nome: pokemon.name,
          imagem: pokemon.sprites.other['official-artwork'].front_default ?? pokemon.sprites.front_default,
          tipos: pokemon.types.map((t: any) => t.type.name),
        },
      ];
      
      // Salva a nova equipa no Fastify
      await salvarEquipe(perfil.id, novaEquipe);
      navigate('/equipe');
    } catch (e) {
      setAviso('Falha ao comunicar com o servidor do Laboratório.');
      setSalvando(false);
    }
  };

  if (loadingPokemon) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>Analisando dados biológicos... 🧬</h3>;
  if (erro) return <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>;
  if (!pokemon) return null;

  const imagem = pokemon.sprites.other['official-artwork'].front_default ?? pokemon.sprites.front_default;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc' }}>⬅ Voltar</button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ textTransform: 'capitalize', fontSize: '2rem', margin: 0 }}>{pokemon.name} <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Nº{pokemon.id}</span></h2>

        <img src={imagem} alt={pokemon.name} style={{ width: '250px', height: '250px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {pokemon.types.map((t: any) => (
            <span key={t.type.name} style={{ padding: '0.5rem 1rem', backgroundColor: '#536583', color: 'white', borderRadius: '20px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {t.type.name}
            </span>
          ))}
        </div>

        <div style={{ width: '100%', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Estatísticas base</h4>
          {pokemon.stats.map((s: any) => (
            <div key={s.stat.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ textTransform: 'capitalize' }}>{s.stat.name}</span>
              <strong>{s.base_stat}</strong>
            </div>
          ))}
        </div>

        {aviso && (
          <div style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {aviso}
          </div>
        )}

        {!perfil && (
          <p style={{ color: '#64748b', margin: '0 0 1rem 0' }}>Entre com um perfil para adicionar este Pokémon a uma equipe.</p>
        )}

        <button
          onClick={capturarParaEquipe}
          disabled={jaNaEquipe || loadingEquipe || salvando}
          style={{ 
            width: '100%', padding: '1rem', fontSize: '1.1rem', 
            backgroundColor: (jaNaEquipe || loadingEquipe) ? '#94a3b8' : '#ef4444', 
            color: 'white', border: 'none', borderRadius: '8px', 
            cursor: (jaNaEquipe || loadingEquipe || salvando) ? 'default' : 'pointer', 
            fontWeight: 'bold', opacity: salvando ? 0.7 : 1
          }}
        >
          {!perfil ? '🔑 Entrar para adicionar' : 
            loadingEquipe ? 'A verificar base de dados... ⏳' : 
            jaNaEquipe ? '✅ Já está na sua equipe' : 
            salvando ? 'A capturar... 🔴' : '🔴 Adicionar à equipe'}
        </button>
      </div>
    </div>
  );
}