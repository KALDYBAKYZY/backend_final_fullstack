const mongoose = require('mongoose');
const User = require('../../src/models/User');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/studyhub_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  it('should create a user with valid fields', async () => {
    const user = await User.create({
      username: 'testuser', email: 'test@test.com', password: 'password123',
    });
    expect(user._id).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.role).toBe('student');
  });

  it('should hash the password before saving', async () => {
    const user = await User.create({
      username: 'hashtest', email: 'hash@test.com', password: 'plaintext',
    });
    expect(user.password).not.toBe('plaintext');
  });

  it('should require username and email', async () => {
    await expect(User.create({ password: '123456' })).rejects.toThrow();
  });

  it('should not expose password in toJSON', async () => {
    const user = await User.create({
      username: 'jsontest', email: 'json@test.com', password: 'secret123',
    });
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
  });
});