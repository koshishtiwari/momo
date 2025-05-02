import { PrismaClient } from '@prisma/client';
import { searchCache } from './redis';

const prisma = new PrismaClient();

interface SearchOptions {
  limit?: number;
  offset?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class SearchEngine {
  // Calculate Levenshtein distance for fuzzy matching
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Generate tokens from a string (for partial matching)
  private static generateTokens(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .split(/\s+/)            // Split by whitespace
      .filter(token => token.length > 2); // Only keep tokens with length > 2
  }

  // Search products with fuzzy matching and partial word matching
  public static async searchProducts(query: string, options: SearchOptions = {}) {
    if (!query || query.trim() === '') {
      return this.getProducts(options);
    }

    // Normalize search query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check cache first
    const cacheKey = `${normalizedQuery}:${JSON.stringify(options)}`;
    const cachedResults = await searchCache.get(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Get all products that might match
    const allProducts = await this.getProducts({
      ...options,
      limit: options.limit ? options.limit * 3 : 60 // Get more products for filtering
    });

    // Extract search tokens
    const searchTokens = this.generateTokens(normalizedQuery);
    
    // Score and sort products
    const scoredProducts = allProducts.map(product => {
      // Prepare product text for matching
      const productText = `${product.name} ${product.description} ${product.sku}`.toLowerCase();
      const productTokens = this.generateTokens(productText);
      
      // Calculate best token match scores
      const tokenScores = searchTokens.map(searchToken => {
        // Check for exact matches first
        if (productText.includes(searchToken)) {
          return 1.0;
        }
        
        // Check for partial matches with product tokens
        const partialScores = productTokens.map(productToken => {
          // If product token starts with search token
          if (productToken.startsWith(searchToken)) {
            return 0.9;
          }
          
          // If product token contains search token
          if (productToken.includes(searchToken)) {
            return 0.8;
          }
          
          // Fuzzy match with Levenshtein distance
          const distance = this.levenshteinDistance(searchToken, productToken);
          const maxLength = Math.max(searchToken.length, productToken.length);
          const fuzzyScore = 1 - (distance / maxLength);
          
          return fuzzyScore > 0.7 ? fuzzyScore : 0; // Only consider reasonably good matches
        });
        
        return Math.max(0, ...partialScores);
      });
      
      // Calculate final relevance score (average of token scores)
      const relevanceScore = tokenScores.reduce((sum, score) => sum + score, 0) / 
                             Math.max(1, tokenScores.length);
      
      return {
        ...product,
        relevanceScore
      };
    });
    
    // Filter by minimum relevance and sort by score
    const results = scoredProducts
      .filter(product => product.relevanceScore > 0.5) // Only keep reasonable matches
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
      .slice(0, options.limit || 20); // Apply limit
    
    // Cache results
    await searchCache.set(cacheKey, results);
    
    return results;
  }

  // Get products with filtering
  private static async getProducts(options: SearchOptions = {}) {
    return prisma.product.findMany({
      where: {
        ...(options.categoryId ? { categoryId: options.categoryId } : {}),
        ...(options.minPrice || options.maxPrice ? {
          price: {
            ...(options.minPrice ? { gte: options.minPrice } : {}),
            ...(options.maxPrice ? { lte: options.maxPrice } : {})
          }
        } : {}),
      },
      take: options.limit || 20,
      skip: options.offset || 0,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export default SearchEngine;