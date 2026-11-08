import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  it('GET /health', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /projects', async () => {
    const res = await request(app.getHttpServer()).get('/projects').expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /projects/:slug returns 404 for an unknown slug', () => {
    return request(app.getHttpServer()).get('/projects/nope').expect(404);
  });

  it('POST /contact accepts a valid message', () => {
    return request(app.getHttpServer())
      .post('/contact')
      .send({ name: 'Ada', email: 'ada@example.com', message: 'Hello there, Sarah!' })
      .expect(202);
  });

  it('POST /contact rejects an invalid email', () => {
    return request(app.getHttpServer())
      .post('/contact')
      .send({ name: 'Ada', email: 'not-an-email', message: 'Hello there, Sarah!' })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
