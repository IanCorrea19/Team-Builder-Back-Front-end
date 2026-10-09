import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../data/database';

interface Perfil {
  id: string;
  nome: string;
  avatar: string;
  salt: string;
  senhaHash: string;
  criadoEm: number;
}

interface Membro {
  id: number;
  nome: string;
  imagem: string;
  tipos: string[];
}

export async function perfisRoutes(server: FastifyInstance) {

  // LISTAR TODOS OS PERFIS
  server.get('/', async (request, reply) => {
    const perfis = db
      .prepare('SELECT * FROM perfis ORDER BY criadoEm ASC')
      .all();

    return reply.status(200).send(perfis);
  });


  // BUSCAR UM PERFIL
  server.get<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      const perfil = db
        .prepare('SELECT * FROM perfis WHERE id = ?')
        .get(request.params.id);

      if (!perfil) {
        return reply
          .status(404)
          .send({ erro: 'Perfil não encontrado' });
      }

      return reply.status(200).send(perfil);
    }
  );


  // CRIAR PERFIL
  server.post<{ Body: Partial<Perfil> }>(
    '/',
    async (request, reply) => {
      const { nome, avatar, salt, senhaHash } = request.body;

      if (!nome || !avatar) {
        return reply
          .status(400)
          .send({ erro: 'Nome e avatar são obrigatórios' });
      }

      // Verificar se já existe a combinação nome + avatar
      const perfilExistente = db
        .prepare(`
          SELECT id
          FROM perfis
          WHERE nome = ? AND avatar = ?
        `)
        .get(nome, avatar);

      if (perfilExistente) {
        return reply
          .status(409)
          .send({
            erro: 'Já existe um perfil com esse nome e ícone.'
          });
      }

      const novoPerfil: Perfil = {
        id: crypto.randomUUID(),
        nome,
        avatar,
        salt: salt || '',
        senhaHash: senhaHash || '',
        criadoEm: Date.now()
      };

      try {
        db.prepare(`
          INSERT INTO perfis
            (id, nome, avatar, salt, senhaHash, criadoEm)
          VALUES
            (?, ?, ?, ?, ?, ?)
        `).run(
          novoPerfil.id,
          novoPerfil.nome,
          novoPerfil.avatar,
          novoPerfil.salt,
          novoPerfil.senhaHash,
          novoPerfil.criadoEm
        );
      } catch (erro) {
        if (
          erro instanceof Error &&
          erro.message.includes('UNIQUE constraint failed')
        ) {
          return reply
            .status(409)
            .send({
              erro: 'Já existe um perfil com esse nome e ícone.'
            });
        }

        throw erro;
      }

      return reply
        .status(201)
        .send(novoPerfil);
    }
  );


  // ATUALIZAR PERFIL
  server.put<{
    Params: { id: string };
    Body: Partial<Perfil>;
  }>(
    '/:id',
    async (request, reply) => {
      const perfil = db
        .prepare('SELECT * FROM perfis WHERE id = ?')
        .get(request.params.id) as Perfil | undefined;

      if (!perfil) {
        return reply
          .status(404)
          .send({ erro: 'Perfil não encontrado' });
      }

      const atualizado = {
        ...perfil,
        ...request.body
      };

      // Verificar se outro perfil já usa o mesmo nome + avatar
      const perfilExistente = db
        .prepare(`
          SELECT id
          FROM perfis
          WHERE nome = ?
            AND avatar = ?
            AND id != ?
        `)
        .get(
          atualizado.nome,
          atualizado.avatar,
          request.params.id
        );

      if (perfilExistente) {
        return reply
          .status(409)
          .send({
            erro: 'Já existe um perfil com esse nome e ícone.'
          });
      }

      try {
        db.prepare(`
          UPDATE perfis
          SET
            nome = ?,
            avatar = ?,
            salt = ?,
            senhaHash = ?
          WHERE id = ?
        `).run(
          atualizado.nome,
          atualizado.avatar,
          atualizado.salt,
          atualizado.senhaHash,
          request.params.id
        );
      } catch (erro) {
        if (
          erro instanceof Error &&
          erro.message.includes('UNIQUE constraint failed')
        ) {
          return reply
            .status(409)
            .send({
              erro: 'Já existe um perfil com esse nome e ícone.'
            });
        }

        throw erro;
      }

      return reply
        .status(200)
        .send(atualizado);
    }
  );


  // EXCLUIR PERFIL
  server.delete<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      const resultado = db
        .prepare('DELETE FROM perfis WHERE id = ?')
        .run(request.params.id);

      if (resultado.changes === 0) {
        return reply
          .status(404)
          .send({ erro: 'Perfil não encontrado' });
      }

      return reply.status(204).send();
    }
  );


  // BUSCAR EQUIPE
  server.get<{ Params: { id: string } }>(
    '/:id/equipe',
    async (request, reply) => {
      const perfil = db
        .prepare('SELECT id FROM perfis WHERE id = ?')
        .get(request.params.id);

      if (!perfil) {
        return reply
          .status(404)
          .send({ erro: 'Perfil não encontrado' });
      }

      const equipe = db
        .prepare(`
          SELECT
            pokemonId AS id,
            nome,
            imagem,
            tipos
          FROM equipes
          WHERE perfilId = ?
          ORDER BY id ASC
        `)
        .all(request.params.id)
        .map((pokemon: any) => ({
          ...pokemon,
          tipos: JSON.parse(pokemon.tipos)
        }));

      return reply.status(200).send(equipe);
    }
  );


  // SALVAR EQUIPE
  server.put<{
    Params: { id: string };
    Body: Membro[];
  }>(
    '/:id/equipe',
    async (request, reply) => {
      const perfil = db
        .prepare('SELECT id FROM perfis WHERE id = ?')
        .get(request.params.id);

      if (!perfil) {
        return reply
          .status(404)
          .send({ erro: 'Perfil não encontrado' });
      }

      const equipe = request.body;

      if (!Array.isArray(equipe)) {
        return reply
          .status(400)
          .send({
            erro: 'A equipe deve ser uma lista de Pokémon'
          });
      }

      if (equipe.length > 6) {
        return reply
          .status(400)
          .send({
            erro: 'A equipe pode ter no máximo 6 Pokémon'
          });
      }

      const apagarEquipe = db.prepare(
        'DELETE FROM equipes WHERE perfilId = ?'
      );

      const adicionarPokemon = db.prepare(`
        INSERT INTO equipes
          (perfilId, pokemonId, nome, imagem, tipos)
        VALUES
          (?, ?, ?, ?, ?)
      `);

      const salvarEquipe = db.transaction(() => {
        apagarEquipe.run(request.params.id);

        for (const pokemon of equipe) {
          adicionarPokemon.run(
            request.params.id,
            pokemon.id,
            pokemon.nome,
            pokemon.imagem,
            JSON.stringify(pokemon.tipos)
          );
        }
      });

      salvarEquipe();

      return reply.status(200).send(equipe);
    }
  );
}