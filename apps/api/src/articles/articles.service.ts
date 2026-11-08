import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../env.js';
import type { Article } from './article.js';

interface DevToArticle {
  title: string;
  url: string;
  cover_image: string | null;
  reading_time_minutes: number;
  published_at: string;
}

const CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private cache?: { articles: Article[]; expiresAt: number };

  constructor(private readonly config: ConfigService<Env, true>) {}

  async findAll(): Promise<Article[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.articles;

    const username = this.config.get('DEVTO_USERNAME', { infer: true });
    try {
      const res = await fetch(`https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=10`);
      if (!res.ok) throw new Error(`dev.to responded ${res.status}`);
      const articles = ((await res.json()) as DevToArticle[]).map((a) => ({
        title: a.title,
        url: a.url,
        coverImage: a.cover_image,
        readingMinutes: a.reading_time_minutes,
        publishedAt: a.published_at,
      }));
      this.cache = { articles, expiresAt: Date.now() + CACHE_TTL_MS };
      return articles;
    } catch (error) {
      // A stale list beats an empty window
      if (this.cache) return this.cache.articles;
      this.logger.error(`Couldn't fetch articles: ${(error as Error).message}`);
      throw new ServiceUnavailableException("Couldn't load articles");
    }
  }
}
