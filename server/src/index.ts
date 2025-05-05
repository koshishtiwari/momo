// Initialize OpenTelemetry - must be first import
import './telemetry';

import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import routes from './routes';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Fastify instance
const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// Register plugins
fastify.register(fastifyCors, {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// Register JWT
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-change-in-production'
});

// Add user to request type
declare module 'fastify' {
  interface FastifyRequest {
    user: string | object | Buffer<ArrayBufferLike>;
  }
}

// Register routes
fastify.register(routes, { prefix: '/api' });

// Graceful shutdown
const shutdown = async () => {
  fastify.log.info('Shutting down server...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

// Handle termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();