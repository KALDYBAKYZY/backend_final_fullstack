const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../../server');
const User = require('../../src/models/User');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/studyhub_test_auth');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  server.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  it('POST /api/auth/register — creates user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice', email: 'alice@test.com', password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alice');
  });

  it('POST /api/auth/login — returns token for valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'bob', email: 'bob@test.com', password: 'pass1234',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'carol', email: 'carol@test.com', password: 'correct',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'carol@test.com', password: 'wrong',
    });
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — returns user for valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      username: 'dave', email: 'dave@test.com', password: 'pass1234',
    });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('dave');
  });
});