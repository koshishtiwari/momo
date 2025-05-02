import { FastifyRequest, FastifyReply } from 'fastify';
import { createMagicLinkToken, verifyMagicLinkToken, getOrCreateCustomer } from '../middlewares/auth';
import { z } from 'zod';

// Login schema for validation
const loginSchema = z.object({
  email: z.string().email(),
});

// Verify token schema
const verifyTokenSchema = z.object({
  token: z.string(),
});

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validate request body
    const { email } = loginSchema.parse(request.body);
    
    // Generate magic link token
    const token = await createMagicLinkToken(email);
    
    // In a real app, you would send this token via email
    // For this demo, we'll just return it
    reply.send({
      success: true,
      message: 'Magic link token generated',
      // In production, don't return the token directly
      // This is just for demo purposes
      token,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof z.ZodError 
        ? 'Invalid email address' 
        : 'Failed to generate login link',
    });
  }
};

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validate request body
    const { token } = verifyTokenSchema.parse(request.body);
    
    // Verify the token
    const email = await verifyMagicLinkToken(token);
    
    if (!email) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    
    // Get or create the user
    const user = await getOrCreateCustomer(email);
    
    // Generate JWT
    const jwt = await reply.jwtSign({
      id: user.id,
      email: user.email,
      role: user.role,
    }, { expiresIn: '7d' });
    
    reply.send({
      success: true,
      message: 'Successfully authenticated',
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof z.ZodError 
        ? 'Invalid token format' 
        : 'Authentication failed',
    });
  }
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // The user is available from the JWT verification
    const user = request.user;
    
    reply.send({
      success: true,
      user,
    });
  } catch (error) {
    reply.status(401).send({
      success: false,
      error: 'Unauthorized',
    });
  }
};