import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Pokedex from './pages/Pokedex';
import DetalhesPokemon from './pages/DetalhesPokemon';
import Equipe from './pages/Equipe';
import Perfis from './pages/Perfis';
import { getPerfilAtivo, sair } from './perfis';

function Menu() {
  useLocation(); // faz o menu reler o perfil ativo a cada navegação
  const navigate = useNavigate();
  const perfil = getPerfilAtivo();

  const estiloLink = ({ isActive }: { isActive: boolean }) => ({
    color: 'white', textDecoration: 'none', fontWeight: 'bold' as const, padding: '0.4rem 0.8rem',
    borderRadius: '6px', backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
  });

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: '#ef4444', padding: '0.75rem 1.5rem', marginBottom: '2rem' }}>
      <strong style={{ color: 'white', marginRight: 'auto', fontSize: '1.2rem' }}>Pokédex</strong>
      <NavLink to="/pokedex" style={estiloLink}>Pokédex</NavLink>
      {perfil ? (
        <>
          <NavLink to="/equipe" style={estiloLink}>Equipe</NavLink>
          <NavLink to="/perfis" style={estiloLink}>Perfis</NavLink>
          <span style={{ color: 'white', marginLeft: '0.5rem' }}>{perfil.avatar} {perfil.nome}</span>
          <button onClick={() => { sair(); navigate('/'); }} style={{ marginLeft: '0.5rem', padding: '0.4rem 0.8rem', cursor: 'pointer', borderRadius: '6px', border: '2px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold' }}>
            Sair
          </button>
        </>
      ) : (
        <NavLink to="/" style={estiloLink}>Entrar</NavLink>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Menu />
      <div style={{ padding: '0 1rem' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:name" element={<DetalhesPokemon />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/perfis" element={<Perfis />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
