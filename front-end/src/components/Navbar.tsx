import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem 2rem', backgroundColor: '#ef4444', display: 'flex', gap: '2rem', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <strong style={{ color: 'white', fontSize: '1.25rem', letterSpacing: '1px' }}>🔴 Laboratório Pokémon</strong>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        <Link to="/equipa" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>A Minha Equipa</Link>
        <Link to="/pokedex" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Pokédex</Link>
      </div>
    </nav>
  );
}