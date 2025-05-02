import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { productCache } from '../utils/redis';
import SearchEngine from '../utils/search';

const prisma = new PrismaClient();

// Get products schema
const getProductsSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  categoryId: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

// Get product by ID schema
const getProductSchema = z.object({
  id: z.string(),
});

// Search products schema
const searchProductsSchema = z.object({
  query: z.string(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  categoryId: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

export const getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { limit, offset, categoryId, minPrice, maxPrice } = getProductsSchema.parse(request.query);
    
    // Generate cache key
    const cacheKey = `products:${limit}:${offset}:${categoryId || ''}:${minPrice || ''}:${maxPrice || ''}`;
    
    // Try to get from cache first
    const cachedProducts = await productCache.get(cacheKey);
    if (cachedProducts) {
      return reply.send({
        success: true,
        data: cachedProducts,
      });
    }
    
    // If not in cache, fetch from database
    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(minPrice || maxPrice ? {
          price: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {})
          }
        } : {}),
      },
      include: {
        category: true,
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      }
    });
    
    // Store in cache for future requests
    await productCache.set(cacheKey, products);
    
    reply.send({
      success: true,
      data: products,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof z.ZodError 
        ? 'Invalid query parameters' 
        : 'Failed to fetch products',
    });
  }
};

export const getProductById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = getProductSchema.parse(request.params);
    
    // Try to get from cache first
    const cacheKey = `product:${id}`;
    const cachedProduct = await productCache.get(cacheKey);
    if (cachedProduct) {
      return reply.send({
        success: true,
        data: cachedProduct,
      });
    }
    
    // If not in cache, fetch from database
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });
    
    if (!product) {
      return reply.status(404).send({
        success: false,
        error: 'Product not found',
      });
    }
    
    // Store in cache for future requests
    await productCache.set(cacheKey, product);
    
    reply.send({
      success: true,
      data: product,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof z.ZodError 
        ? 'Invalid product ID' 
        : 'Failed to fetch product',
    });
  }
};

export const searchProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { query, limit, offset, categoryId, minPrice, maxPrice } = searchProductsSchema.parse(request.query);
    
    // Use our search engine for typo-tolerance and partial word matching
    const products = await SearchEngine.searchProducts(query, {
      limit,
      offset,
      categoryId,
      minPrice,
      maxPrice,
    });
    
    reply.send({
      success: true,
      data: products,
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof z.ZodError 
        ? 'Invalid search parameters' 
        : 'Failed to search products',
    });
  }
};