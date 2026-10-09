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

// O banco de dados em memória que será perdido ao reiniciar
export const db = {
  perfis: [] as Perfil[],
  equipes: {} as Record<string, Membro[]> // A chave é o ID do perfil
};