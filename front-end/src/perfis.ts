export interface Perfil {
  id: string;
  nome: string;
  avatar: string;
  salt: string;
  senhaHash: string;
  criadoEm: number;
}

export interface Membro {
  id: number;
  nome: string;
  imagem: string;
  tipos: string[];
}

export const AVATARES = ['🔥', '💧', '🍃', '⚡', '🌙', '⭐', '👻', '🐉'];
export const MAX_EQUIPE = 6;
const K_ATIVO = 'perfilAtivo';

// Endereço do seu servidor Fastify
const API_URL = 'http://localhost:3000/api/perfis'; 

async function gerarHash(senha: string, salt: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + senha));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const novoSalt = () => crypto.randomUUID();

// GET: Lista todos os perfis da API própria
export async function listarPerfis(): Promise<Perfil[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Falha ao carregar perfis do servidor');
    return await res.json();
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    return [];
  }
}

// POST: Cria um novo perfil na API própria
export async function cadastrar(nome: string, avatar: string, senha: string): Promise<Perfil> {
  const salt = novoSalt();
  const senhaHash = await gerarHash(senha, salt);
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, avatar, salt, senhaHash })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.erro || 'Erro ao cadastrar');
  }
  
  const novoPerfil = await res.json();
  localStorage.setItem(K_ATIVO, JSON.stringify(novoPerfil));
  return novoPerfil;
}

// GET por ID: Faz o login verificando a senha com o banco
export async function entrar(id: string, senha: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) return false;
  
  const perfil: Perfil = await res.json();
  if (perfil.senhaHash && (await gerarHash(senha, perfil.salt)) !== perfil.senhaHash) return false;
  
  localStorage.setItem(K_ATIVO, JSON.stringify(perfil));
  return true;
}

// Retorna quem está logado no momento (Mockado no LocalStorage conforme exigência)
export function getPerfilAtivo(): Perfil | null {
  try {
    const ativo = localStorage.getItem(K_ATIVO);
    return ativo ? JSON.parse(ativo) : null;
  } catch {
    return null;
  }
}

export const sair = () => localStorage.removeItem(K_ATIVO);

// PUT: Atualiza os dados do perfil no Fastify
export async function atualizarPerfil(id: string, dados: { nome?: string; avatar?: string; senha?: string }) {
  const updates: Partial<Perfil> = { nome: dados.nome, avatar: dados.avatar };
  
  if (dados.senha) {
    updates.salt = novoSalt();
    updates.senhaHash = await gerarHash(dados.senha, updates.salt);
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!res.ok) throw new Error('Erro ao atualizar no servidor');
  const atualizado = await res.json();
  
  if (getPerfilAtivo()?.id === id) localStorage.setItem(K_ATIVO, JSON.stringify(atualizado));
}

// DELETE: Exclui o perfil da API
export async function excluirPerfil(id: string) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (getPerfilAtivo()?.id === id) sair();
}

// GET: Busca a equipe do perfil no Fastify
export async function lerEquipe(id: string): Promise<Membro[]> {
  try {
    const res = await fetch(`${API_URL}/${id}/equipe`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro ao ler equipe:", error);
    return [];
  }
}

// PUT: Salva a equipe na API
export async function salvarEquipe(id: string, equipe: Membro[]) {
  await fetch(`${API_URL}/${id}/equipe`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipe)
  });
}