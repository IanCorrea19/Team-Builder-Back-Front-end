import Fastify from 'fastify';
import cors from '@fastify/cors';
import { perfisRoutes } from './routes/perfis.routes';

const server = Fastify({ logger: true });

server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Rota de teste do servidor
server.get('/health', async () => {
  return {
    status: 'ok',
    mensagem: 'Servidor Fastify funcionando'
  };
});

// Rotas dos perfis
server.register(perfisRoutes, {
  prefix: '/api/perfis'
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });

    console.log('Servidor rodando em http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();