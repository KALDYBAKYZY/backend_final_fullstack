const request = require('supertest')
const mongoose = require('mongoose')
const User = require('../../src/models/User')

process.env.MONGO_URI = 'mongodb://localhost:27017/studyhub_test_notes'
const { app, server } = require('../../server')

let token

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send({
    username: 'noter', email: 'noter@test.com', password: 'pass1234',
  })
  token = res.body.token
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  server.close()
})

describe('Notes API', () => {
  it('POST /api/notes — creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Note', content: 'Hello world', subject: 'Math' })
    expect(res.status).toBe(201)
    expect(res.body.title).toBe('Test Note')
  })

  it('GET /api/notes — returns own notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/notes — returns 401 without token', async () => {
    const res = await request(app).get('/api/notes')
    expect(res.status).toBe(401)
  })
})