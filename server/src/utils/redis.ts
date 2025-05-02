import Redis from 'ioredis';

// Create Redis client
const redisClient = new Redis(process.env.REDIS_URL as string);

export class RedisCache {
  private prefix: string;
  private defaultTtl: number;

  constructor(prefix: string, defaultTtl: number = 3600) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(this.getKey(key));
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      return null;
    }
  }

  // Set data to cache with optional TTL in seconds
  async set(key: string, value: any, ttl: number = this.defaultTtl): Promise<void> {
    const serialized = JSON.stringify(value);
    await redisClient.set(this.getKey(key), serialized, 'EX', ttl);
  }

  // Delete a key from cache
  async del(key: string): Promise<void> {
    await redisClient.del(this.getKey(key));
  }

  // Flush all keys with this prefix
  async flush(): Promise<void> {
    const keys = await redisClient.keys(`${this.prefix}:*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  // Check if a key exists
  async exists(key: string): Promise<boolean> {
    return (await redisClient.exists(this.getKey(key))) === 1;
  }
}

// Singleton instances for different cache domains
export const productCache = new RedisCache('product', 3600); // 1 hour
export const categoryCache = new RedisCache('category', 7200); // 2 hours
export const searchCache = new RedisCache('search', 1800); // 30 minutes

export default redisClient;