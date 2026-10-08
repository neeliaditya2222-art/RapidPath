import { RouteAnalysisResult } from '../../types';
import { config } from '../../config';

interface CacheItem {
  data: RouteAnalysisResult;
  expiresAt: number;
}

export class RouteCacheService {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTtlMs: number;

  constructor() {
    this.defaultTtlMs = (config.cache.ttlSeconds || 120) * 1000;
    // Periodic garbage collection of expired cache entries
    setInterval(() => this.cleanup(), 60000);
  }

  private generateKey(originLat: number, originLng: number, destLat: number, destLng: number, vehicleType: string, priority: string): string {
    const roundLat1 = originLat.toFixed(3);
    const roundLng1 = originLng.toFixed(3);
    const roundLat2 = destLat.toFixed(3);
    const roundLng2 = destLng.toFixed(3);
    return `${roundLat1},${roundLng1}:${roundLat2},${roundLng2}:${vehicleType}:${priority}`;
  }

  public get(originLat: number, originLng: number, destLat: number, destLng: number, vehicleType: string, priority: string): RouteAnalysisResult | null {
    const key = this.generateKey(originLat, originLng, destLat, destLng, vehicleType, priority);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  public set(originLat: number, originLng: number, destLat: number, destLng: number, vehicleType: string, priority: string, data: RouteAnalysisResult, ttlMs?: number): void {
    const key = this.generateKey(originLat, originLng, destLat, destLng, vehicleType, priority);
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs),
    });
  }

  public invalidate(originLat: number, originLng: number, destLat: number, destLng: number, vehicleType: string, priority: string): void {
    const key = this.generateKey(originLat, originLng, destLat, destLng, vehicleType, priority);
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const routeCacheService = new RouteCacheService();
