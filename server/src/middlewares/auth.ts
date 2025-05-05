import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { RedisCache } from '../utils/redis';

const prisma = new PrismaClient();
const authCache = new RedisCache('auth', 3600); // 1 hour TTL for auth tokens

// Generate a random token
export const generateToken = (): string => {
  return randomBytes(48).toString('base64url');
};

// Create a magic link token for passwordless auth
export const createMagicLinkToken = async (email: string): Promise<string> => {
  const token = generateToken();
  // Store token in Redis with email as value and short expiration
  await authCache.set(`magic-link:${token}`, email, 15 * 60); // 15 minutes
  return token;
};

// Verify a magic link token
export const verifyMagicLinkToken = async (token: string): Promise<string | null> => {
  const email = await authCache.get<string>(`magic-link:${token}`);
  if (email) {
    // Remove the token so it can't be used again
    await authCache.del(`magic-link:${token}`);
  }
  return email;
};

// Check if user is authenticated
export const isAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      success: false,
      error: 'Unauthorized'
    });
  }
};

// Check if user is admin
export const isAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
    
    if (typeof request.user === 'object' && 'role' in request.user && request.user.role !== 'admin') {
      reply.status(403).send({
        success: false,
        error: 'Forbidden: Admin access required'
      });
    }
  } catch (err) {
    reply.status(401).send({
      success: false,
      error: 'Unauthorized'
    });
  }
};

// Get or create a customer by email
export const getOrCreateCustomer = async (email: string) => {
  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        role: 'customer'
      }
    });
  }

  return user;
};