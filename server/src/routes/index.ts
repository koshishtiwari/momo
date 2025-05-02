import { FastifyInstance } from 'fastify';
import * as AuthController from '../controllers/auth';
import * as ProductController from '../controllers/product';
import { isAuthenticated } from '../middlewares/auth';

export default async function routes(fastify: FastifyInstance) {
  // Health check route
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Auth routes
  fastify.post('/auth/login', AuthController.login);
  fastify.post('/auth/verify-token', AuthController.verifyToken);
  fastify.get('/auth/me', { onRequest: [isAuthenticated] }, AuthController.getCurrentUser);

  // Product routes
  fastify.get('/products', ProductController.getProducts);
  fastify.get('/products/search', ProductController.searchProducts);
  fastify.get('/products/:id', ProductController.getProductById);
}