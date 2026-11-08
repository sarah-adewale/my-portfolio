import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArticlesService } from './articles.service.js';

const devToArticle = {
  title: 'Getting started with Reactjs and Nextjs',
  url: 'https://dev.to/sarahadewale/x',
  cover_image: 'https://example.com/cover.png',
  reading_time_minutes: 4,
  published_at: '2023-03-23T00:00:00Z',
};

describe('ArticlesService', () => {
  const config = { get: () => 'sarahadewale' } as unknown as ConfigService<never, true>;
  let service: ArticlesService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    service = new ArticlesService(config);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('maps dev.to articles and caches them', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([devToArticle])));

    const first = await service.findAll();
    await service.findAll();

    expect(first).toEqual([
      {
        title: devToArticle.title,
        url: devToArticle.url,
        coverImage: devToArticle.cover_image,
        readingMinutes: 4,
        publishedAt: devToArticle.published_at,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws 503 when dev.to fails and nothing is cached', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));

    await expect(service.findAll()).rejects.toThrow(ServiceUnavailableException);
  });
});
