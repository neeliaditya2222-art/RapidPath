import request from 'supertest';
import { createApp } from '../app';

describe('Health and System Endpoints', () => {
  const app = createApp();

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services).toBeDefined();
  });

  it('GET /api/unknown-endpoint returns 404', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
